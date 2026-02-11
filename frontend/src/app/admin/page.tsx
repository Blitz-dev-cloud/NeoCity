"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaUserShield,
  FaUserMd,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaArrowLeft,
  FaUserCheck,
  FaBan,
} from "react-icons/fa";
import {
  IdentityRegistryABI,
  EHRRegistryABI,
  SupplyChainABI,
  GrievanceABI,
} from "@/contracts/abis";
import { contractAddresses } from "@/contracts/addresses";

// Contract owner address (deployer - Hardhat account #0)
const ADMIN_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "pending" | "doctors" | "all" | "roles"
  >("pending");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Check if user is admin
  const isAdmin = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

  // Identity Registry - Write contract
  const {
    writeContract: writeIdentity,
    data: identityHash,
    isPending: identityPending,
  } = useWriteContract();
  const { isLoading: identityConfirming, isSuccess: identitySuccess } =
    useWaitForTransactionReceipt({
      hash: identityHash,
    });

  // EHR Registry - Write contract
  const {
    writeContract: writeEHR,
    data: ehrHash,
    isPending: ehrPending,
  } = useWriteContract();
  const { isLoading: ehrConfirming, isSuccess: ehrSuccess } =
    useWaitForTransactionReceipt({
      hash: ehrHash,
    });

  // State for identities
  interface Identity {
    did: string;
    owner: string;
    role: number;
    status: number;
    timestamp: number;
  }

  const [pendingIdentities, setPendingIdentities] = useState<Identity[]>([]);
  const [allIdentities, setAllIdentities] = useState<Identity[]>([]);
  const [authorizedDoctors, setAuthorizedDoctors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Fetch identities using events (real-time monitoring)
  useEffect(() => {
    const fetchIdentities = async () => {
      if (!isConnected || !isAdmin) return;
      setIsLoading(true);

      try {
        const { readContract, getBlockNumber, getLogs } = await import(
          "wagmi/actions"
        );
        const { config } = await import("@/config/wagmi");

        // Get current block
        const currentBlock = await getBlockNumber(config);

        // Fetch IdentityRegistered events from the last 10000 blocks
        const fromBlock = currentBlock > 10000n ? currentBlock - 10000n : 0n;

        const logs = await getLogs(config, {
          address: contractAddresses.IdentityRegistry as `0x${string}`,
          event: {
            type: "event",
            name: "IdentityRegistered",
            inputs: [
              { type: "string", indexed: true, name: "did" },
              { type: "address", indexed: true, name: "owner" },
              { type: "uint8", indexed: false, name: "role" },
              { type: "uint256", indexed: false, name: "timestamp" },
            ],
          },
          fromBlock,
          toBlock: "latest",
        });

        const identities: Identity[] = [];

        // For each event, fetch current identity status
        for (const log of logs) {
          try {
            const did = log.args.did as string;

            // Read identity details from contract
            const identityData = (await readContract(config, {
              address: contractAddresses.IdentityRegistry as `0x${string}`,
              abi: IdentityRegistryABI,
              functionName: "identities",
              args: [did],
            })) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any

            const identity: Identity = {
              did: did,
              owner: identityData[0] as string,
              role: Number(identityData[2]),
              status: Number(identityData[3]),
              timestamp: Number(identityData[4]),
            };

            identities.push(identity);
          } catch (err) {
            console.error("Error fetching identity details:", err);
          }
        }

        // Separate pending and all
        const pending = identities.filter((id) => id.status === 0); // PENDING = 0
        setPendingIdentities(pending);
        setAllIdentities(identities);
        setLastFetchTime(Date.now());
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching identities:", error);
        setIsLoading(false);
      }
    };

    fetchIdentities();

    // Real-time polling every 5 seconds
    const interval = setInterval(fetchIdentities, 5000);
    return () => clearInterval(interval);
  }, [isConnected, isAdmin, identitySuccess]);

  // Fetch authorized doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!isConnected || !isAdmin) return;

      try {
        // Filter identities with DOCTOR role (role = 4) and APPROVED status (status = 1)
        const doctors = allIdentities
          .filter((id) => id.role === 4 && id.status === 1)
          .map((id) => id.did);

        setAuthorizedDoctors(doctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, [isConnected, isAdmin, allIdentities]);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Show success notification after blockchain confirmation
  useEffect(() => {
    if (identitySuccess) {
      showNotification("Identity status updated successfully!", "success");
    }
  }, [identitySuccess]);

  useEffect(() => {
    if (ehrSuccess) {
      showNotification(
        "Doctor authorized in healthcare system successfully!",
        "success"
      );
    }
  }, [ehrSuccess]);

  const handleApproveIdentity = (did: string) => {
    try {
      writeIdentity({
        address: contractAddresses.IdentityRegistry as `0x${string}`,
        abi: IdentityRegistryABI,
        functionName: "approveIdentity",
        args: [did],
      });
    } catch (error) {
      console.error("Approval failed:", error);
      showNotification(
        "Failed to approve identity. Please try again.",
        "error"
      );
    }
  };

  const handleRejectIdentity = (did: string) => {
    try {
      writeIdentity({
        address: contractAddresses.IdentityRegistry as `0x${string}`,
        abi: IdentityRegistryABI,
        functionName: "rejectIdentity",
        args: [did],
      });
    } catch (error) {
      console.error("Rejection failed:", error);
      showNotification("Failed to reject identity. Please try again.", "error");
    }
  };

  const handleAuthorizeDoctor = (did: string) => {
    try {
      writeEHR({
        address: contractAddresses.EHRRegistry as `0x${string}`,
        abi: EHRRegistryABI,
        functionName: "authorizeDoctorWithDID",
        args: [did],
      });
    } catch (error) {
      console.error("Doctor authorization failed:", error);
      showNotification(
        "Failed to authorize doctor. Please try again.",
        "error"
      );
    }
  };

  const handleDeauthorizeDoctor = (doctorAddress: string) => {
    try {
      writeEHR({
        address: contractAddresses.EHRRegistry as `0x${string}`,
        abi: EHRRegistryABI,
        functionName: "deauthorizeDoctor",
        args: [doctorAddress as `0x${string}`],
      });
    } catch (error) {
      console.error("Doctor deauthorization failed:", error);
      showNotification(
        "Failed to deauthorize doctor. Please try again.",
        "error"
      );
    }
  };

  // Supply Chain Roles
  const handleGrantFarmerRole = (farmerAddress: string) => {
    try {
      writeContract({
        address: contractAddresses.SupplyChain as `0x${string}`,
        abi: SupplyChainABI,
        functionName: "registerFarmer",
        args: [farmerAddress as `0x${string}`],
      });
      showNotification("Granting FARMER role...", "success");
    } catch (error) {
      console.error("Farmer registration failed:", error);
      showNotification("Failed to grant FARMER role", "error");
    }
  };

  const handleGrantVendorRole = (vendorAddress: string) => {
    try {
      writeContract({
        address: contractAddresses.SupplyChain as `0x${string}`,
        abi: SupplyChainABI,
        functionName: "registerVendor",
        args: [vendorAddress as `0x${string}`],
      });
      showNotification("Granting VENDOR role...", "success");
    } catch (error) {
      console.error("Vendor registration failed:", error);
      showNotification("Failed to grant VENDOR role", "error");
    }
  };

  // Grievance Resolver Role
  const handleGrantResolverRole = (resolverAddress: string) => {
    try {
      writeContract({
        address: contractAddresses.Grievance as `0x${string}`,
        abi: GrievanceABI,
        functionName: "grantRole",
        args: [
          "0x55435dd261a4b9b3364963f7738a7a662ad9c84396d64be3365284bb7f0a5041", // RESOLVER_ROLE hash
          resolverAddress as `0x${string}`,
        ],
      });
      showNotification("Granting RESOLVER role...", "success");
    } catch (error) {
      console.error("Resolver role grant failed:", error);
      showNotification("Failed to grant RESOLVER role", "error");
    }
  };

  // Use writeContract from the first declaration
  const writeContract = writeIdentity;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-gray-900 to-purple-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-3xl border-2 border-purple-500/30 p-8 text-center shadow-2xl"
        >
          <FaUserShield className="w-24 h-24 text-purple-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Admin Access Required
          </h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to access the admin dashboard.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all"
          >
            Go Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-gray-900 to-purple-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-3xl border-2 border-red-500/30 p-8 text-center shadow-2xl"
        >
          <FaBan className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Access Denied
          </h2>
          <p className="text-gray-400 mb-2">
            You are not authorized to access the admin dashboard.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Only the contract deployer can access this page.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl transition-all"
          >
            Go Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-gray-900 to-purple-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4 transition-colors"
          >
            <FaArrowLeft /> Back to Home
          </button>
          <div className="flex items-center gap-4 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full"></div>
              <FaUserShield className="w-12 h-12 text-purple-500 relative" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-400">
                Manage identities and authorize doctors
              </p>
            </div>
          </div>

          {/* Real-time Status Indicator */}
          <div className="mt-4 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-400">Real-time monitoring active</span>
            </div>
            <div className="text-gray-500">•</div>
            <div className="text-gray-400">Updates every 5 seconds</div>
            {lastFetchTime > 0 && (
              <>
                <div className="text-gray-500">•</div>
                <div className="text-gray-400">
                  Last update: {new Date(lastFetchTime).toLocaleTimeString()}
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Notification */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl border-2 ${
              notification.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {notification.message}
          </motion.div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Pending Approvals</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {pendingIdentities.length}
                </p>
              </div>
              <FaClock className="text-4xl text-yellow-500/50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Authorized Doctors</p>
                <p className="text-3xl font-bold text-green-400">
                  {authorizedDoctors.length}
                </p>
              </div>
              <FaUserMd className="text-4xl text-green-500/50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Identities</p>
                <p className="text-3xl font-bold text-purple-400">
                  {allIdentities.length}
                </p>
              </div>
              <FaUserCheck className="text-4xl text-purple-500/50" />
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto">
          {[
            { id: "pending", label: "Pending Approvals", icon: <FaClock /> },
            { id: "doctors", label: "Authorized Doctors", icon: <FaUserMd /> },
            { id: "all", label: "All Identities", icon: <FaUserCheck /> },
            { id: "roles", label: "Manage Roles", icon: <FaUserShield /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id as "pending" | "doctors" | "all" | "roles")
              }
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6">
          {activeTab === "pending" && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <FaClock className="text-yellow-500" />
                Pending Identity Approvals
              </h2>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading pending identities...</p>
                </div>
              ) : pendingIdentities.length === 0 ? (
                <div className="text-center py-12">
                  <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No pending approvals</p>
                  <p className="text-gray-500 text-sm">
                    All identity registrations have been processed
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingIdentities.map((identity, index) => (
                    <motion.div
                      key={identity.did}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-800/50 rounded-xl p-6 border border-yellow-500/20"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-semibold">
                              {identity.role === 4
                                ? "DOCTOR"
                                : identity.role === 0
                                ? "CITIZEN"
                                : `ROLE ${identity.role}`}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {new Date(
                                identity.timestamp * 1000
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-white font-mono mb-1">
                            DID: {identity.did}
                          </p>
                          <p className="text-gray-400 text-sm">
                            Owner: {identity.owner}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveIdentity(identity.did)}
                            disabled={identityPending || identityConfirming}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all disabled:opacity-50"
                          >
                            <FaCheckCircle />
                            {identityPending || identityConfirming
                              ? "Approving..."
                              : "Approve"}
                          </button>
                          <button
                            onClick={() => handleRejectIdentity(identity.did)}
                            disabled={identityPending || identityConfirming}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all disabled:opacity-50"
                          >
                            <FaTimesCircle />
                            Reject
                          </button>
                        </div>
                      </div>
                      {identity.role === 4 && (
                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <p className="text-blue-400 text-sm mb-2">
                            ⚕️ This is a doctor registration. After approval,
                            authorize in healthcare system:
                          </p>
                          <button
                            onClick={() => handleAuthorizeDoctor(identity.did)}
                            disabled={
                              ehrPending ||
                              ehrConfirming ||
                              identity.status !== 1
                            }
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all disabled:opacity-50 text-sm"
                          >
                            <FaUserMd />
                            {ehrPending || ehrConfirming
                              ? "Authorizing..."
                              : "Authorize as Doctor"}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "doctors" && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <FaUserMd className="text-blue-500" />
                Authorized Doctors
              </h2>
              <div className="text-center py-12">
                <p className="text-gray-400">
                  Doctor management coming soon...
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  You can authorize doctors from the Pending Approvals tab
                </p>
              </div>
            </div>
          )}

          {activeTab === "all" && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <FaUserCheck className="text-purple-500" />
                All Registered Identities
              </h2>
              <div className="text-center py-12">
                <p className="text-gray-400">Identity list coming soon...</p>
                <p className="text-gray-500 text-sm mt-2">
                  Full identity management interface in development
                </p>
              </div>
            </div>
          )}

          {activeTab === "roles" && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <FaUserShield className="text-purple-500" />
                Manage System Roles
              </h2>

              <div className="space-y-6">
                {/* Assign Doctor Role */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                    <FaUserMd />
                    Assign Doctor Role
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Grant DOCTOR role to authorize medical professionals to
                    access and manage patient health records
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter wallet address (0x...)"
                      className="flex-1 px-4 py-3 bg-black/50 border border-blue-500/30 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400"
                      id="doctorAddress"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(
                          "doctorAddress"
                        ) as HTMLInputElement;
                        if (input.value) {
                          handleAuthorizeDoctor(
                            `did:neocity:${input.value.toLowerCase()}`
                          );
                          input.value = "";
                        }
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all"
                    >
                      Grant Role
                    </button>
                  </div>
                </div>

                {/* Assign Farmer Role */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-green-400 mb-4">
                    Assign Farmer Role
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Grant FARMER role to allow registration of new product
                    batches in the supply chain
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter wallet address (0x...)"
                      className="flex-1 px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white placeholder-green-300/50 focus:outline-none focus:border-green-400"
                      id="farmerAddress"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(
                          "farmerAddress"
                        ) as HTMLInputElement;
                        if (input.value) {
                          handleGrantFarmerRole(input.value);
                          input.value = "";
                        }
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all"
                    >
                      Grant Role
                    </button>
                  </div>
                </div>

                {/* Assign Vendor Role */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-yellow-400 mb-4">
                    Assign Vendor Role
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Grant VENDOR role to allow receiving and transferring
                    product batches
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter wallet address (0x...)"
                      className="flex-1 px-4 py-3 bg-black/50 border border-yellow-500/30 rounded-xl text-white placeholder-yellow-300/50 focus:outline-none focus:border-yellow-400"
                      id="vendorAddress"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(
                          "vendorAddress"
                        ) as HTMLInputElement;
                        if (input.value) {
                          handleGrantVendorRole(input.value);
                          input.value = "";
                        }
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all"
                    >
                      Grant Role
                    </button>
                  </div>
                </div>

                {/* Assign Resolver Role */}
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-orange-400 mb-4">
                    Assign Resolver Role
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Grant RESOLVER role to allow handling and resolving citizen
                    grievances
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter wallet address (0x...)"
                      className="flex-1 px-4 py-3 bg-black/50 border border-orange-500/30 rounded-xl text-white placeholder-orange-300/50 focus:outline-none focus:border-orange-400"
                      id="resolverAddress"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(
                          "resolverAddress"
                        ) as HTMLInputElement;
                        if (input.value) {
                          handleGrantResolverRole(input.value);
                          input.value = "";
                        }
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all"
                    >
                      Grant Role
                    </button>
                  </div>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mt-6">
                  <p className="text-purple-300 text-sm">
                    ℹ️ <strong>Note:</strong> All role assignments are permanent
                    blockchain transactions. Make sure to verify wallet
                    addresses before granting roles.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-xl border border-purple-500/20 p-6">
            <FaClock className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Pending</h3>
            <p className="text-3xl font-bold text-purple-400">
              {pendingIdentities.length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-xl border border-blue-500/20 p-6">
            <FaUserMd className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Doctors</h3>
            <p className="text-3xl font-bold text-blue-400">
              {authorizedDoctors.length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl rounded-xl border border-green-500/20 p-6">
            <FaUserCheck className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Total Identities</h3>
            <p className="text-3xl font-bold text-green-400">
              {allIdentities.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
