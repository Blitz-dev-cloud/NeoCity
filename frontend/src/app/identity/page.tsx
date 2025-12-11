"use client";

import { useState, useEffect } from "react";
import { useAccount, useBlockNumber } from "wagmi";
import { useRouter } from "next/navigation";
import { useIdentityRegistry } from "@/hooks/useIdentityRegistry";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaIdCard,
  FaWallet,
  FaShieldAlt,
  FaUserCheck,
  FaLock,
  FaSpinner,
  FaInfoCircle,
  FaCheckCircle,
  FaClock,
  FaUserPlus,
  FaUsers,
  FaChartLine,
  FaArrowLeft,
} from "react-icons/fa";

// Notification Component
interface NotificationProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

const Notification = ({ message, type, onClose }: NotificationProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? "from-green-500/20 to-green-600/20 border-green-500/30"
      : type === "error"
      ? "from-red-500/20 to-red-600/20 border-red-500/30"
      : "from-blue-500/20 to-blue-600/20 border-blue-500/30";

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className={`fixed top-4 right-4 z-50 bg-gradient-to-r ${bgColor} backdrop-blur-xl border rounded-2xl shadow-2xl p-4 max-w-md`}
    >
      <p className="text-white font-medium">{message}</p>
    </motion.div>
  );
};

// Stats Card Component
const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  trend?: { value: string; positive: boolean };
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gradient-to-br ${gradient} border border-gray-700 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group hover:scale-105 transition-transform`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          {title}
        </span>
        <Icon className="text-2xl opacity-50" />
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{subtitle}</div>
      {trend && (
        <div
          className={`text-xs mt-2 ${
            trend.positive ? "text-green-400" : "text-red-400"
          }`}
        >
          {trend.positive ? "↗" : "↘"} {trend.value}
        </div>
      )}
    </div>
  </motion.div>
);

export default function IdentityPage() {
  const { address, isConnected } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "overview" | "register" | "verification"
  >("overview");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Registration Form
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [idNumber, setIdNumber] = useState("");

  const {
    useUserDIDs,
    useIdentityByDID,
    useVerifyIdentity,
    registerIdentity,
    updateIdentity,
    revokeIdentity,
    isPending,
    isConfirming,
    isSuccess,
  } = useIdentityRegistry();

  // Get user's DID (first one in their list)
  const { data: userDID } = useUserDIDs(address);
  const did = userDID && typeof userDID === "string" ? userDID : "";

  // Get identity data using the DID
  const { data: identityData } = useIdentityByDID(did);
  const { data: isVerified } = useVerifyIdentity(did);

  // Parse identity data from contract (Identity struct)
  const hasIdentity =
    identityData && Array.isArray(identityData) && identityData[0];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const identityOwner = hasIdentity ? identityData[0] : "";
  const didDocument = hasIdentity ? identityData[1] : "";
  const isActive = hasIdentity ? identityData[2] : false;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createdAt = hasIdentity ? identityData[3] : 0;

  // Parse DID document to extract user info
  let identityName = "";
  let identityDOB = "";
  let identityIDNumber = "";

  if (didDocument && typeof didDocument === "string") {
    try {
      const parsed = JSON.parse(didDocument);
      identityName = parsed.name || "";
      identityDOB = parsed.dateOfBirth || "";
      identityIDNumber = parsed.idNumber || "";
    } catch (e) {
      console.error("Error parsing DID document:", e);
    }
  }

  // Mock stats (in real app, fetch from contract)
  const totalRegistrations = 1247;
  const verificationRate = 94.3;
  const pendingReviews = 23;

  // Notification helper
  const showNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setNotification({ message, type });
  };

  // Handle Register
  const handleRegister = async () => {
    if (!name || !dateOfBirth || !idNumber || !isConnected || !address) return;
    try {
      registerIdentity(name, dateOfBirth, idNumber, address);
      // Success will be shown via useEffect watching isSuccess
    } catch (error) {
      console.error("Registration failed:", error);
      showNotification("Registration failed. Please try again.", "error");
    }
  };

  // Watch for transaction success
  useEffect(() => {
    if (isSuccess) {
      showNotification(
        "Identity registered successfully! Your DID is now active.",
        "success"
      );
      setName("");
      setDateOfBirth("");
      setIdNumber("");
      setActiveTab("overview");
    }
  }, [isSuccess]);

  // Auto-refresh on new blocks
  useEffect(() => {
    if (blockNumber) {
      // Trigger data refresh
    }
  }, [blockNumber]);

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-3xl border-2 border-orange-500/30 p-8 text-center shadow-2xl shadow-orange-500/20"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full"></div>
            <FaWallet className="w-24 h-24 text-orange-500 mx-auto relative animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Connect Your Wallet
          </h2>
          <p className="text-gray-400 mb-6 text-lg">
            Please connect your wallet to manage your digital identity
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-800/50 rounded-lg px-4 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Powered by Sepolia Testnet
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black pb-20">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600/20 to-yellow-600/20 hover:from-orange-600/30 hover:to-yellow-600/30 backdrop-blur-xl rounded-xl border border-orange-500/30 hover:border-orange-500/50 text-white transition-all group"
      >
        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to City</span>
      </motion.button>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600/10 via-yellow-600/10 to-amber-600/10 border-b border-gray-800 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-xl">
                  <FaIdCard className="text-3xl text-orange-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-yellow-400 to-amber-400 bg-clip-text text-transparent">
                    Identity Registry
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Secure blockchain-based identity management
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-xl px-6 py-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">Sepolia Network</span>
              </div>
              {blockNumber && (
                <div className="text-xs text-gray-500 text-center">
                  Block: {blockNumber.toString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="YOUR STATUS"
            value={
              hasIdentity && isActive
                ? "VERIFIED"
                : hasIdentity
                ? "INACTIVE"
                : "UNREGISTERED"
            }
            subtitle={
              hasIdentity && isActive
                ? "Identity Active"
                : hasIdentity
                ? "Identity Revoked"
                : "Register Now"
            }
            icon={
              hasIdentity && isActive
                ? FaCheckCircle
                : hasIdentity
                ? FaClock
                : FaUserPlus
            }
            gradient={
              hasIdentity && isActive
                ? "from-green-500/20 to-green-600/20"
                : hasIdentity
                ? "from-red-500/20 to-red-600/20"
                : "from-gray-500/20 to-gray-600/20"
            }
          />
          <StatsCard
            title="TOTAL USERS"
            value={`${totalRegistrations.toLocaleString()}`}
            subtitle="Registered"
            icon={FaUsers}
            gradient="from-blue-500/20 to-blue-600/20"
            trend={{ value: "+12 today", positive: true }}
          />
          <StatsCard
            title="VERIFICATION RATE"
            value={`${verificationRate}%`}
            subtitle="Approved"
            icon={FaChartLine}
            gradient="from-purple-500/20 to-purple-600/20"
          />
          <StatsCard
            title="PENDING REVIEWS"
            value={`${pendingReviews}`}
            subtitle="In Queue"
            icon={FaClock}
            gradient="from-orange-500/20 to-orange-600/20"
          />
        </div>

        {/* Identity Status Banner */}
        {hasIdentity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${
              isActive
                ? "from-green-900/40 to-green-800/40 border-green-500/30"
                : "from-red-900/40 to-red-800/40 border-red-500/30"
            } border rounded-2xl p-6 backdrop-blur-xl`}
          >
            <div className="flex items-start gap-4">
              {isActive ? (
                <FaCheckCircle className="text-3xl text-green-400 flex-shrink-0 mt-1" />
              ) : (
                <FaClock className="text-3xl text-red-400 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  {isActive ? "Identity Active ✓" : "Identity Inactive"}
                </h3>
                <p className="text-gray-300 text-sm">
                  {isActive
                    ? "Your decentralized identity (DID) is active! You now have full access to all NeoCity services."
                    : "Your identity has been revoked or deactivated. Contact city administrators for assistance."}
                </p>
                {did && (
                  <p className="text-green-400/80 text-xs mt-2 font-mono">
                    DID: {did}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-800 overflow-x-auto">
          {[
            { key: "overview", label: "Overview" },
            {
              key: "register",
              label: hasIdentity ? "Update Info" : "Register",
            },
            { key: "verification", label: "Benefits" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-6 py-3 font-semibold transition-all relative capitalize whitespace-nowrap ${
                activeTab === tab.key
                  ? "text-orange-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeIdentityTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-yellow-400"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Identity Card */}
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-8 backdrop-blur-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-2xl">
                    <FaIdCard className="text-4xl text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Digital Identity Card
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {address?.slice(0, 10)}...{address?.slice(-8)}
                    </p>
                  </div>
                </div>

                {hasIdentity ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">
                          Full Name
                        </div>
                        <div className="text-lg font-semibold text-white">
                          {identityName}
                        </div>
                      </div>
                      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">
                          Date of Birth
                        </div>
                        <div className="text-lg font-semibold text-white">
                          {identityDOB}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">
                          ID Number
                        </div>
                        <div className="text-lg font-semibold text-white font-mono">
                          {identityIDNumber}
                        </div>
                      </div>
                      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">
                          Verification Status
                        </div>
                        <div
                          className={`text-lg font-semibold flex items-center gap-2 ${
                            isActive ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {isActive ? (
                            <>
                              <FaCheckCircle /> Active
                            </>
                          ) : (
                            <>
                              <FaClock /> Inactive
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaUserPlus className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">
                      No Identity Registered
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Register your identity to access all NeoCity services
                    </p>
                    <button
                      onClick={() => setActiveTab("register")}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/30"
                    >
                      <FaUserPlus className="inline mr-2" />
                      Register Now
                    </button>
                  </div>
                )}
              </div>

              {/* Security Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                  <FaShieldAlt className="text-3xl text-blue-400 mb-3" />
                  <h3 className="text-lg font-bold text-white mb-2">
                    Blockchain Security
                  </h3>
                  <p className="text-sm text-gray-400">
                    Your identity is secured by blockchain technology, ensuring
                    immutability and transparency.
                  </p>
                </div>
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                  <FaLock className="text-3xl text-purple-400 mb-3" />
                  <h3 className="text-lg font-bold text-white mb-2">
                    Privacy Protected
                  </h3>
                  <p className="text-sm text-gray-400">
                    Your personal data is encrypted and only accessible with
                    your wallet signature.
                  </p>
                </div>
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                  <FaUserCheck className="text-3xl text-green-400 mb-3" />
                  <h3 className="text-lg font-bold text-white mb-2">
                    Verified Trust
                  </h3>
                  <p className="text-sm text-gray-400">
                    Verified identities gain access to premium services and
                    higher trust levels.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* REGISTER TAB */}
          {activeTab === "register" && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-8 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-orange-500/20 rounded-xl">
                    <FaUserPlus className="text-orange-400 text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {hasIdentity
                        ? "Update Your Identity"
                        : "Register Your Identity"}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {hasIdentity
                        ? "Update your information (requires re-verification)"
                        : "Submit your information for verification"}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-medium">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-medium">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-medium">
                      Government ID Number
                    </label>
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="ABC123456789"
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                  </div>

                  <button
                    onClick={handleRegister}
                    disabled={
                      !name ||
                      !dateOfBirth ||
                      !idNumber ||
                      isPending ||
                      isConfirming
                    }
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isPending || isConfirming ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        {isPending ? "Sending..." : "Confirming..."}
                      </>
                    ) : (
                      <>
                        <FaUserCheck />{" "}
                        {hasIdentity ? "Update Identity" : "Register Identity"}
                      </>
                    )}
                  </button>

                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <FaInfoCircle className="text-orange-400 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-gray-300">
                        <p className="font-semibold mb-1">
                          Registration Process
                        </p>
                        <ul className="text-gray-400 space-y-1">
                          <li>
                            • Your information is encrypted before submission
                          </li>
                          <li>
                            • City administrators review within 24-48 hours
                          </li>
                          <li>
                            • You&apos;ll be notified once verification is
                            complete
                          </li>
                          <li>
                            • All data is stored securely on the blockchain
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* BENEFITS TAB */}
          {activeTab === "verification" && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-8 backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Benefits of Verified Identity
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4 bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                    <FaCheckCircle className="text-2xl text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-white mb-2">
                        Governance Access
                      </h3>
                      <p className="text-sm text-gray-400">
                        Create proposals and vote on city decisions with
                        verified identity status.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                    <FaCheckCircle className="text-2xl text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-white mb-2">
                        Financial Services
                      </h3>
                      <p className="text-sm text-gray-400">
                        Apply for loans, higher limits, and better rates with
                        verified identity.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
                    <FaCheckCircle className="text-2xl text-purple-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-white mb-2">
                        Healthcare Records
                      </h3>
                      <p className="text-sm text-gray-400">
                        Access secure medical records and healthcare services
                        across the platform.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-orange-500/10 border border-orange-500/20 rounded-xl p-6">
                    <FaCheckCircle className="text-2xl text-orange-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-white mb-2">
                        Civic Services
                      </h3>
                      <p className="text-sm text-gray-400">
                        File grievances, access public services, and interact
                        with city systems.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {!hasIdentity && (
                <div className="text-center bg-gradient-to-br from-orange-900/40 to-yellow-900/40 border border-orange-500/30 rounded-2xl p-8">
                  <FaUserPlus className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Get Started Today
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Register your identity now to unlock all NeoCity features
                  </p>
                  <button
                    onClick={() => setActiveTab("register")}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/30"
                  >
                    Register Your Identity
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
