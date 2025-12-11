"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTruck,
  FaBox,
  FaWarehouse,
  FaQrcode,
  FaMapMarkerAlt,
  FaExchangeAlt,
  FaCheckCircle,
  FaShieldAlt,
  FaArrowLeft,
} from "react-icons/fa";
import { SupplyChainABI } from "@/contracts/abis";
import { contractAddresses } from "@/contracts/addresses";
import { uploadJSONToIPFS, getIPFSUrl, fetchFromIPFS } from "@/utils/pinata";

// Type definitions
interface Batch {
  id: string;
  product: string;
  quantity: number;
  location: string;
  status: string;
  owner: string;
  timestamp: bigint;
  metadata: Record<string, unknown> | null;
  metadataHash?: string;
}

export default function SupplyChainPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"register" | "track" | "transfer">(
    "register"
  );
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Form states
  const [batchId, setBatchId] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [trackBatchId, setTrackBatchId] = useState("");
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false);
  const [metadata, setMetadata] = useState({
    certifications: "",
    origin: "",
    expiryDate: "",
  });

  // State for fetched batches
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isLoadingBatch, setIsLoadingBatch] = useState(false);

  // Write contract
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch user's batches on load or after successful transaction
  useEffect(() => {
    const fetchUserBatches = async () => {
      if (!isConnected || !address) {
        setBatches([]);
        return;
      }

      try {
        const { readContract } = await import("wagmi/actions");
        const { config } = await import("@/config/wagmi");

        // Get all batch IDs owned by user
        const batchIds = (await readContract(config, {
          address: contractAddresses.SupplyChain as `0x${string}`,
          abi: SupplyChainABI,
          functionName: "getOwnerBatches",
          args: [address],
        })) as string[];

        const fetchedBatches: Batch[] = [];

        // Fetch details for each batch
        for (const batchId of batchIds) {
          try {
            const batchData = (await readContract(config, {
              address: contractAddresses.SupplyChain as `0x${string}`,
              abi: SupplyChainABI,
              functionName: "getBatch",
              args: [batchId],
            })) as readonly [
              string,
              `0x${string}`,
              string,
              number,
              bigint,
              bigint,
              string
            ];

            const [
              id,
              owner,
              product,
              statusNum,
              qty,
              timestamp,
              metadataHash,
            ] = batchData;

            const statusMap: Record<number, string> = {
              0: "Created",
              1: "In Transit",
              2: "Delivered",
              3: "Sold",
              4: "Recalled",
            };

            // Fetch metadata from IPFS
            let metadata: Record<string, unknown> | null = null;
            if (metadataHash && metadataHash !== "") {
              try {
                const ipfsHash = metadataHash.replace("ipfs://", "");
                const fetchedData = await fetchFromIPFS(ipfsHash);
                if (
                  typeof fetchedData === "object" &&
                  !(fetchedData instanceof Blob)
                ) {
                  metadata = fetchedData;
                }
              } catch (e) {
                console.log("Could not fetch IPFS metadata:", e);
              }
            }

            fetchedBatches.push({
              id,
              product,
              quantity: Number(qty),
              location: (metadata?.location as string) || "Unknown",
              status: statusMap[statusNum] || "Created",
              owner,
              timestamp,
              metadata,
              metadataHash,
            });
          } catch (error) {
            console.error(`Error fetching batch ${batchId}:`, error);
          }
        }

        setBatches(fetchedBatches);
        console.log("✅ Fetched batches:", fetchedBatches.length);
      } catch (error) {
        console.error("❌ Error fetching user batches:", error);
        setBatches([]);
      }
    };

    fetchUserBatches();
  }, [isConnected, address, isSuccess]);

  // Fetch batch details when trackBatchId changes
  useEffect(() => {
    const fetchBatch = async () => {
      if (!trackBatchId) {
        setSelectedBatch(null);
        return;
      }

      setIsLoadingBatch(true);

      try {
        const { readContract } = await import("wagmi/actions");
        const { config } = await import("@/config/wagmi");

        const batchData = (await readContract(config, {
          address: contractAddresses.SupplyChain as `0x${string}`,
          abi: SupplyChainABI,
          functionName: "getBatch",
          args: [trackBatchId],
        })) as readonly [
          string,
          `0x${string}`,
          string,
          number,
          bigint,
          bigint,
          string
        ];

        const [id, owner, product, statusNum, qty, timestamp, metadataHash] =
          batchData;

        const statusMap: Record<number, string> = {
          0: "Created",
          1: "In Transit",
          2: "Delivered",
          3: "Sold",
          4: "Recalled",
        };

        // Fetch metadata from IPFS if available
        let metadata: Record<string, unknown> | null = null;
        if (metadataHash && metadataHash !== "") {
          try {
            const ipfsHash = metadataHash.replace("ipfs://", "");
            const fetchedData = await fetchFromIPFS(ipfsHash);
            if (
              typeof fetchedData === "object" &&
              !(fetchedData instanceof Blob)
            ) {
              metadata = fetchedData;
            }
          } catch (err) {
            console.error("Error fetching metadata from IPFS:", err);
          }
        }

        setSelectedBatch({
          id,
          product,
          quantity: Number(qty),
          location: (metadata?.location as string) || "Unknown",
          owner,
          status: statusMap[statusNum] || "Created",
          timestamp,
          metadata,
          metadataHash,
        });
      } catch (error) {
        console.error("Error fetching batch:", error);
        showNotification("Batch not found", "error");
      }

      setIsLoadingBatch(false);
    };

    fetchBatch();
  }, [trackBatchId]);

  // Show success notification after blockchain confirmation
  useEffect(() => {
    if (isSuccess) {
      showNotification(
        "Batch registered successfully on blockchain!",
        "success"
      );
      setBatchId("");
      setProductName("");
      setQuantity("");
      setLocation("");
      setMetadata({ certifications: "", origin: "", expiryDate: "" });
    }
  }, [isSuccess]);

  const handleRegisterBatch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!batchId || !productName || !quantity || !location) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    setIsUploadingToIPFS(true);

    try {
      // Upload batch metadata to IPFS
      const batchMetadata = {
        batchId,
        productName,
        quantity,
        location,
        certifications: metadata.certifications.split(",").map((c) => c.trim()),
        origin: metadata.origin,
        expiryDate: metadata.expiryDate,
        registeredAt: Date.now(),
      };

      const ipfsHash = await uploadJSONToIPFS(batchMetadata, {
        name: `batch-${batchId}-${Date.now()}`,
        keyvalues: {
          type: "supply-chain-batch",
          batchId,
          productName,
        },
      });

      // REMOVED premature success notification
      setIsUploadingToIPFS(false);

      // Register on blockchain - success will be shown via useEffect
      writeContract({
        address: contractAddresses.SupplyChain as `0x${string}`,
        abi: SupplyChainABI,
        functionName: "registerBatch",
        args: [batchId, productName, ipfsHash, BigInt(quantity), location],
      });
    } catch (error) {
      setIsUploadingToIPFS(false);
      showNotification(
        error instanceof Error ? error.message : "Error uploading to IPFS",
        "error"
      );
      console.error(error);
    }
  };

  const handleTransferOwnership = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!trackBatchId || !newOwner) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    try {
      writeContract({
        address: contractAddresses.SupplyChain as `0x${string}`,
        abi: SupplyChainABI,
        functionName: "transferOwnership",
        args: [trackBatchId, newOwner as `0x${string}`],
      });
    } catch (error) {
      showNotification("Error transferring ownership", "error");
      console.error(error);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      showNotification("Operation completed successfully!", "success");
      setBatchId("");
      setProductName("");
      setQuantity("");
      setLocation("");
      setNewOwner("");
    }
  }, [isSuccess]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-green-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-black/40 backdrop-blur-xl rounded-3xl p-12 max-w-md w-full border border-green-500/30 shadow-2xl"
        >
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full">
                <FaWarehouse className="text-5xl text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Supply Chain Portal
            </h2>
            <p className="text-green-200 mb-8">
              Connect your wallet to manage product batches and track shipments
            </p>
            <div className="flex items-center justify-center gap-2 text-green-300">
              <FaBox />
              <span>Please connect your wallet to continue</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-green-800 p-8">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600/30 to-emerald-600/30 hover:from-green-600/40 hover:to-emerald-600/40 backdrop-blur-xl rounded-xl border border-green-500/30 hover:border-green-500/50 text-white transition-all group"
      >
        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to City</span>
      </motion.button>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className={`fixed top-8 left-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl ${
              notification.type === "success"
                ? "bg-green-500/90 border border-green-400"
                : "bg-red-500/90 border border-red-400"
            }`}
          >
            <p className="text-white font-semibold">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
              <FaWarehouse className="text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                Supply Chain Portal
              </h1>
              <p className="text-green-200">Farm to Table Tracking</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-300 text-sm font-medium">
                Total Batches
              </span>
              <FaBox className="text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">156</p>
            <p className="text-green-200 text-xs mt-1">Registered products</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-300 text-sm font-medium">
                In Transit
              </span>
              <FaTruck className="text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">23</p>
            <p className="text-green-200 text-xs mt-1">Active shipments</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-300 text-sm font-medium">
                Delivered
              </span>
              <FaCheckCircle className="text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">89</p>
            <p className="text-green-200 text-xs mt-1">Completed deliveries</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-300 text-sm font-medium">
                Verified
              </span>
              <FaShieldAlt className="text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">98%</p>
            <p className="text-green-200 text-xs mt-1">Audit pass rate</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 bg-black/40 backdrop-blur-xl rounded-2xl p-2 border border-green-500/30">
            {[
              { id: "register", label: "Register Batch", icon: FaBox },
              { id: "track", label: "Track Shipment", icon: FaQrcode },
              {
                id: "transfer",
                label: "Transfer Ownership",
                icon: FaExchangeAlt,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                    : "text-green-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "register" && (
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-green-500/30">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaBox className="text-green-400" />
                Register New Product Batch
              </h2>

              <form onSubmit={handleRegisterBatch} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-green-200 mb-2 font-medium">
                      Batch ID
                    </label>
                    <input
                      type="text"
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                      placeholder="BATCH-2024-001"
                      className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white placeholder-green-300/50 focus:outline-none focus:border-green-400 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-green-200 mb-2 font-medium">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Organic Tomatoes"
                      className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white placeholder-green-300/50 focus:outline-none focus:border-green-400 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-green-200 mb-2 font-medium">
                      Quantity (kg)
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="1000"
                      className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white placeholder-green-300/50 focus:outline-none focus:border-green-400 transition-colors"
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-green-200 mb-2 font-medium">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Farm District, NeoCity"
                      className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white placeholder-green-300/50 focus:outline-none focus:border-green-400 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <h3 className="text-green-200 font-semibold mb-2 flex items-center gap-2">
                    <FaShieldAlt className="text-green-400" />
                    Blockchain Tracking
                  </h3>
                  <ul className="text-green-300/80 text-sm space-y-1">
                    <li>• Permanent record on the blockchain</li>
                    <li>• Full ownership history tracked automatically</li>
                    <li>• QR code generated for easy scanning</li>
                    <li>• Audit trail maintained for compliance</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isPending || isConfirming}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {isPending || isConfirming ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isPending ? "Confirming..." : "Processing..."}
                    </span>
                  ) : (
                    "Register Batch"
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === "track" && (
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-green-500/30">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaQrcode className="text-green-400" />
                Track Product Batch
              </h2>

              {/* Show user's batches */}
              {!trackBatchId && batches.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Your Registered Batches
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {batches.map((batch, index) => (
                      <div
                        key={index}
                        onClick={() => setTrackBatchId(batch.id)}
                        className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 cursor-pointer hover:bg-green-500/20 transition-colors"
                      >
                        <p className="text-white font-semibold">
                          {batch.product}
                        </p>
                        <p className="text-green-300 text-sm">
                          Batch ID: {batch.id}
                        </p>
                        <p className="text-green-300 text-sm">
                          Quantity: {batch.quantity}
                        </p>
                        <span
                          className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${
                            batch.status === "Created"
                              ? "bg-green-500/20 text-green-300 border-green-500/30"
                              : batch.status === "In Transit"
                              ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                              : batch.status === "Delivered"
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                              : batch.status === "Sold"
                              ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                              : "bg-red-500/20 text-red-300 border-red-500/30"
                          }`}
                        >
                          {batch.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-green-300/70 text-sm mt-4">
                    Click on a batch to view details
                  </p>
                </div>
              )}

              <div className="mb-8">
                <input
                  type="text"
                  value={trackBatchId}
                  onChange={(e) => setTrackBatchId(e.target.value)}
                  placeholder="Enter Batch ID..."
                  className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white placeholder-green-300/50 focus:outline-none focus:border-green-400 transition-colors"
                />
                {trackBatchId && (
                  <button
                    onClick={() => setTrackBatchId("")}
                    className="mt-2 text-green-400 hover:text-green-300 text-sm"
                  >
                    ← Back to your batches
                  </button>
                )}
              </div>

              {/* Real-time batch tracking */}
              {isLoadingBatch && (
                <div className="text-center text-green-300 py-8">
                  <FaTruck className="w-12 h-12 mx-auto mb-4 animate-bounce" />
                  Loading batch details...
                </div>
              )}

              {!isLoadingBatch && selectedBatch && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">
                      {selectedBatch.product}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-green-300 mb-1">Batch ID</p>
                        <p className="text-white font-medium">
                          {selectedBatch.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-green-300 mb-1">Quantity</p>
                        <p className="text-white font-medium">
                          {selectedBatch.quantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-green-300 mb-1">Current Location</p>
                        <p className="text-white font-medium flex items-center gap-1">
                          <FaMapMarkerAlt className="text-green-400" />
                          {selectedBatch.location}
                        </p>
                      </div>
                      <div>
                        <p className="text-green-300 mb-1">Status</p>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            selectedBatch.status === "Created"
                              ? "bg-green-500/20 text-green-300 border-green-500/30"
                              : selectedBatch.status === "In Transit"
                              ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                              : selectedBatch.status === "Delivered"
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                              : selectedBatch.status === "Sold"
                              ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                              : "bg-red-500/20 text-red-300 border-red-500/30"
                          }`}
                        >
                          {selectedBatch.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-green-300 mb-1">Owner</p>
                        <p className="text-white font-mono text-xs">
                          {selectedBatch.owner.slice(0, 10)}...
                        </p>
                      </div>
                      <div>
                        <p className="text-green-300 mb-1">Registered</p>
                        <p className="text-white font-medium">
                          {new Date(
                            Number(selectedBatch.timestamp) * 1000
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* IPFS Metadata */}
                  {selectedBatch.metadataHash && (
                    <div className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-green-500/30">
                      <h3 className="text-lg font-bold text-white mb-4">
                        Metadata from IPFS
                      </h3>
                      <p className="text-green-300 text-sm">
                        <a
                          href={getIPFSUrl(selectedBatch.metadataHash || "")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          View on IPFS →
                        </a>
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {!isLoadingBatch && !selectedBatch && trackBatchId && (
                <div className="text-center text-red-300 py-8">
                  Batch not found. Please check the Batch ID.
                </div>
              )}
            </div>
          )}

          {activeTab === "transfer" && (
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-green-500/30">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaExchangeAlt className="text-green-400" />
                Transfer Batch Ownership
              </h2>

              <form onSubmit={handleTransferOwnership} className="space-y-6">
                <div>
                  <label className="block text-green-200 mb-2 font-medium">
                    Batch ID
                  </label>
                  <input
                    type="text"
                    value={trackBatchId}
                    onChange={(e) => setTrackBatchId(e.target.value)}
                    placeholder="BATCH-2024-001"
                    className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white placeholder-green-300/50 focus:outline-none focus:border-green-400 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-green-200 mb-2 font-medium">
                    New Owner Address
                  </label>
                  <input
                    type="text"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white placeholder-green-300/50 focus:outline-none focus:border-green-400 transition-colors"
                    required
                  />
                  <p className="text-green-300/70 text-xs mt-1">
                    Must be a registered farmer or vendor address
                  </p>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <h3 className="text-yellow-200 font-semibold mb-2">
                    ⚠️ Important
                  </h3>
                  <ul className="text-yellow-300/80 text-sm space-y-1">
                    <li>
                      • Ownership transfer is permanent and recorded on
                      blockchain
                    </li>
                    <li>• You cannot reverse this transaction</li>
                    <li>• New owner will have full control of the batch</li>
                    <li>• Original ownership history is preserved</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isPending || isConfirming}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {isPending || isConfirming ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isPending ? "Confirming..." : "Processing..."}
                    </span>
                  ) : (
                    "Transfer Ownership"
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
