"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useRouter } from "next/navigation";
import { formatEther, parseEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaGavel,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaUserTie,
  FaExclamationTriangle,
  FaArrowLeft,
  FaFileUpload,
  FaEye,
} from "react-icons/fa";
import { GrievanceABI } from "@/contracts/abis";
import { contractAddresses } from "@/contracts/addresses";
import { uploadJSONToIPFS, getIPFSUrl, fetchFromIPFS } from "@/utils/pinata";

enum GrievanceStatus {
  Filed = 0,
  UnderReview = 1,
  Resolved = 2,
}

interface GrievanceRecord {
  id: bigint;
  complainantDID: string;
  title: string;
  ipfsHash: string;
  resolver: string;
  status: GrievanceStatus;
  filedAt: bigint;
  resolutionIpfsHash: string;
}

export default function GrievancePage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"file" | "my-grievances" | "all">(
    "file"
  );
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Form states
  const [did, setDid] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("infrastructure");
  const [ipfsHash, setIpfsHash] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState(false);
  const [viewingGrievance, setViewingGrievance] = useState<{
    ipfsHash: string;
    title: string;
    data?: Record<string, unknown>;
  } | null>(null);

  // State for fetched grievances
  const [grievances, setGrievances] = useState<any[]>([]);
  const [isLoadingGrievances, setIsLoadingGrievances] = useState(false);

  // Read contract data
  const { data: grievanceCount } = useReadContract({
    address: contractAddresses.Grievance as `0x${string}`,
    abi: GrievanceABI,
    functionName: "grievanceCount",
  });

  // Write contract
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Auto-set DID when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      setDid(`did:neocity:${address.toLowerCase()}`);
    }
  }, [isConnected, address]);

  // Fetch grievances when count changes
  useEffect(() => {
    const fetchGrievances = async () => {
      if (!grievanceCount || Number(grievanceCount) === 0) {
        setGrievances([]);
        return;
      }

      setIsLoadingGrievances(true);
      const count = Number(grievanceCount);
      const fetchedGrievances: any[] = [];

      for (let i = 1; i <= Math.min(count, 20); i++) {
        try {
          const { readContract } = await import("wagmi/actions");
          const { config } = await import("@/config/wagmi");

          const grievanceData = (await readContract(config, {
            address: contractAddresses.Grievance as `0x${string}`,
            abi: GrievanceABI,
            functionName: "getGrievance",
            args: [BigInt(i)],
          })) as [
            bigint,
            string,
            string,
            string,
            string,
            number,
            string,
            bigint
          ];

          const [
            id,
            didValue,
            titleValue,
            evidenceHash,
            resolver,
            statusNum,
            resolution,
            timestamp,
          ] = grievanceData;

          const statusMap: Record<number, string> = {
            0: "Filed",
            1: "Under Review",
            2: "Resolved",
          };

          fetchedGrievances.push({
            id: Number(id),
            did: didValue,
            title: titleValue,
            evidenceHash,
            resolver,
            status: statusMap[statusNum] || "Filed",
            resolution,
            timestamp: Number(timestamp) * 1000,
          });
        } catch (error) {
          console.error(`Error fetching grievance ${i}:`, error);
        }
      }

      setGrievances(fetchedGrievances);
      setIsLoadingGrievances(false);
    };

    fetchGrievances();
  }, [grievanceCount, isSuccess]);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Show success notification after blockchain confirmation
  useEffect(() => {
    if (isSuccess) {
      showNotification(
        "Grievance filed successfully on blockchain!",
        "success"
      );
      setDid("");
      setTitle("");
      setDescription("");
      setCategory("infrastructure");
      setAttachments([]);
    }
  }, [isSuccess]);

  const handleFileGrievance = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!did || !title || !description) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    setIsUploadingToIPFS(true);

    try {
      // Upload grievance details to IPFS
      const grievanceData = {
        title,
        description,
        category,
        did,
        timestamp: Date.now(),
        hasAttachments: attachments.length > 0,
      };

      const ipfsHash = await uploadJSONToIPFS(grievanceData, {
        name: `grievance-${title.replace(/\s+/g, "-")}-${Date.now()}`,
        keyvalues: {
          type: "grievance",
          category,
          did,
        },
      });

      // REMOVED premature success notification
      setIsUploadingToIPFS(false);

      // Store on blockchain - success will be shown via useEffect
      writeContract({
        address: contractAddresses.Grievance as `0x${string}`,
        abi: GrievanceABI,
        functionName: "fileGrievance",
        args: [did, title, ipfsHash],
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

  const handleViewGrievance = async (ipfsHash: string, title: string) => {
    try {
      showNotification("Fetching grievance from IPFS...", "success");
      const data = (await fetchFromIPFS(ipfsHash)) as Record<string, unknown>;

      setViewingGrievance({
        ipfsHash,
        title,
        data,
      });
    } catch {
      showNotification(
        "Error fetching grievance. Opening IPFS URL...",
        "error"
      );
      window.open(getIPFSUrl(ipfsHash), "_blank");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Limit to 5 files, 5MB each
      const validFiles = files.filter((file) => file.size <= 5 * 1024 * 1024);
      if (validFiles.length < files.length) {
        showNotification("Some files were skipped (max 5MB each)", "error");
      }
      setAttachments((prev) => [...prev, ...validFiles].slice(0, 5));
    }
  };

  useEffect(() => {
    if (isSuccess) {
      showNotification("Grievance filed successfully!", "success");
      setTitle("");
      setDescription("");
      setIpfsHash("");
      setAttachments([]);
    }
  }, [isSuccess]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-orange-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-black/40 backdrop-blur-xl rounded-3xl p-12 max-w-md w-full border border-orange-500/30 shadow-2xl"
        >
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="p-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-full">
                <FaGavel className="text-5xl text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Grievance Portal
            </h2>
            <p className="text-orange-200 mb-8">
              Connect your wallet to file grievances and track resolutions
            </p>
            <div className="flex items-center justify-center gap-2 text-orange-300">
              <FaExclamationTriangle />
              <span>Please connect your wallet to continue</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-orange-800 p-8">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600/30 to-red-600/30 hover:from-orange-600/40 hover:to-red-600/40 backdrop-blur-xl rounded-xl border border-orange-500/30 hover:border-orange-500/50 text-white transition-all group"
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
            <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
              <FaGavel className="text-4xl text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Justice Portal</h1>
              <p className="text-orange-200">File and Track Grievances</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-300 text-sm font-medium">
                Total Cases
              </span>
              <FaFileAlt className="text-orange-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {grievanceCount?.toString() || "0"}
            </p>
            <p className="text-orange-200 text-xs mt-1">All grievances filed</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-300 text-sm font-medium">
                Pending
              </span>
              <FaClock className="text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">12</p>
            <p className="text-orange-200 text-xs mt-1">Under review</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-300 text-sm font-medium">
                Resolved
              </span>
              <FaCheckCircle className="text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">234</p>
            <p className="text-orange-200 text-xs mt-1">Successfully closed</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-300 text-sm font-medium">
                Avg. Resolution
              </span>
              <FaUserTie className="text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">7.2</p>
            <p className="text-orange-200 text-xs mt-1">Days to resolve</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 bg-black/40 backdrop-blur-xl rounded-2xl p-2 border border-orange-500/30">
            {[
              { id: "file", label: "File Grievance", icon: FaFileAlt },
              { id: "my-grievances", label: "My Cases", icon: FaUserTie },
              { id: "all", label: "All Cases", icon: FaGavel },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg"
                    : "text-orange-300 hover:text-white hover:bg-white/10"
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
          {activeTab === "file" && (
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-orange-500/30">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaFileAlt className="text-orange-400" />
                File a New Grievance
              </h2>

              <form onSubmit={handleFileGrievance} className="space-y-6">
                <div>
                  <label className="block text-orange-200 mb-2 font-medium">
                    Your DID (Digital Identity)
                  </label>
                  <input
                    type="text"
                    value={did}
                    onChange={(e) => setDid(e.target.value)}
                    placeholder="did:neocity:..."
                    className="w-full px-4 py-3 bg-black/50 border border-orange-500/30 rounded-xl text-white placeholder-orange-300/50 focus:outline-none focus:border-orange-400 transition-colors"
                    required
                  />
                  <p className="text-orange-300/70 text-xs mt-1">
                    Your registered digital identity from Identity Registry
                  </p>
                </div>

                <div>
                  <label className="block text-orange-200 mb-2 font-medium">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief description of the issue"
                    className="w-full px-4 py-3 bg-black/50 border border-orange-500/30 rounded-xl text-white placeholder-orange-300/50 focus:outline-none focus:border-orange-400 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-orange-200 mb-2 font-medium">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed explanation of your grievance..."
                    rows={6}
                    className="w-full px-4 py-3 bg-black/50 border border-orange-500/30 rounded-xl text-white placeholder-orange-300/50 focus:outline-none focus:border-orange-400 transition-colors resize-none"
                    required
                  />
                  <p className="text-orange-300/70 text-xs mt-1">
                    This will be stored on IPFS for permanent record
                  </p>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                  <h3 className="text-orange-200 font-semibold mb-2 flex items-center gap-2">
                    <FaExclamationTriangle className="text-orange-400" />
                    Important Information
                  </h3>
                  <ul className="text-orange-300/80 text-sm space-y-1">
                    <li>• All grievances are recorded on the blockchain</li>
                    <li>
                      • You will receive updates when a resolver is assigned
                    </li>
                    <li>• Resolution typically takes 5-10 business days</li>
                    <li>• False claims may result in penalties</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isPending || isConfirming}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {isPending || isConfirming ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isPending ? "Confirming..." : "Processing..."}
                    </span>
                  ) : (
                    "File Grievance"
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === "my-grievances" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaUserTie className="text-orange-400" />
                My Grievances
              </h2>

              {isLoadingGrievances ? (
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-12 border border-orange-500/30">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-orange-200 text-center">
                      Loading your grievances...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {grievances.filter(
                    (g) =>
                      g.did === did ||
                      g.did === `did:neocity:${address?.toLowerCase()}`
                  ).length > 0 ? (
                    grievances
                      .filter(
                        (g) =>
                          g.did === did ||
                          g.did === `did:neocity:${address?.toLowerCase()}`
                      )
                      .map((grievance, i) => (
                        <motion.div
                          key={grievance.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30 hover:border-orange-400/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white mb-2">
                                {grievance.title}
                              </h3>
                              <div className="flex items-center gap-4 text-xs mb-3">
                                <span className="text-orange-300">
                                  Filed:{" "}
                                  {new Date(
                                    grievance.timestamp
                                  ).toLocaleDateString()}
                                </span>
                                <span className="text-orange-300">
                                  Case #{grievance.id}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  handleViewGrievance(
                                    grievance.evidenceHash,
                                    grievance.title
                                  )
                                }
                                className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-2 transition-colors"
                              >
                                <FaEye /> View Details on IPFS
                              </button>
                            </div>
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                grievance.status === "Resolved"
                                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                  : grievance.status === "Under Review"
                                  ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                                  : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              }`}
                            >
                              {grievance.status}
                            </div>
                          </div>

                          {grievance.resolver !==
                            "0x0000000000000000000000000000000000000000" && (
                            <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
                              <p className="text-orange-200 text-sm flex items-center gap-2">
                                <FaUserTie className="text-orange-400" />
                                <span>
                                  Assigned to: {grievance.resolver.slice(0, 10)}
                                  ...
                                </span>
                              </p>
                            </div>
                          )}
                        </motion.div>
                      ))
                  ) : (
                    <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-12 border border-orange-500/30 text-center">
                      <FaFileAlt className="w-16 h-16 text-orange-400/50 mx-auto mb-4" />
                      <p className="text-orange-200">No grievances filed yet</p>
                      <p className="text-orange-300/70 text-sm mt-2">
                        Click on &quot;File Grievance&quot; to submit your first
                        case
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "all" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaGavel className="text-orange-400" />
                All Public Grievances
              </h2>

              {isLoadingGrievances ? (
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-12 border border-orange-500/30">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-orange-200 text-center">
                      Loading grievances from blockchain...
                    </p>
                  </div>
                </div>
              ) : grievances.length > 0 ? (
                <div className="space-y-4">
                  {grievances.map((grievance, i) => (
                    <motion.div
                      key={grievance.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30 hover:border-orange-400/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">
                              {grievance.title}
                            </h3>
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                grievance.status === "Resolved"
                                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                  : grievance.status === "Under Review"
                                  ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                                  : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              }`}
                            >
                              {grievance.status}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs mb-3">
                            <span className="text-orange-300">
                              Filed:{" "}
                              {new Date(
                                grievance.timestamp
                              ).toLocaleDateString()}
                            </span>
                            <span className="text-orange-300">
                              Case #{grievance.id}
                            </span>
                            <span className="text-orange-300/70">
                              DID: {grievance.did.slice(0, 20)}...
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              handleViewGrievance(
                                grievance.evidenceHash,
                                grievance.title
                              )
                            }
                            className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-2 transition-colors"
                          >
                            <FaEye /> View Details on IPFS
                          </button>
                        </div>
                      </div>
                      {grievance.resolver &&
                        grievance.resolver !==
                          "0x0000000000000000000000000000000000000000" && (
                          <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
                            <p className="text-orange-200 text-sm flex items-center gap-2">
                              <FaUserTie className="text-orange-400" />
                              <span>
                                Assigned to: {grievance.resolver.slice(0, 10)}
                                ...
                              </span>
                            </p>
                          </div>
                        )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
                  <p className="text-orange-200 text-center">
                    {grievanceCount && Number(grievanceCount) > 0
                      ? `${grievanceCount.toString()} total grievances filed`
                      : "No grievances filed yet"}
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
