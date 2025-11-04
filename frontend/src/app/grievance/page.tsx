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
} from "react-icons/fa";
import { GrievanceABI } from "@/contracts/abis";
import { CONTRACTS } from "@/contracts/addresses";

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
  const [ipfsHash, setIpfsHash] = useState("");

  // Read contract data
  const { data: grievanceCount } = useReadContract({
    address: CONTRACTS.Grievance as `0x${string}`,
    abi: GrievanceABI,
    functionName: "grievanceCount",
  });

  // Write contract
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFileGrievance = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!did || !title || !description) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    // Simulate IPFS upload (in production, upload description to IPFS)
    const mockIpfsHash = `Qm${Math.random().toString(36).substring(2, 15)}`;

    try {
      writeContract({
        address: CONTRACTS.Grievance as `0x${string}`,
        abi: GrievanceABI,
        functionName: "fileGrievance",
        args: [did, title, mockIpfsHash],
      });
    } catch (error) {
      showNotification("Error filing grievance", "error");
      console.error(error);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      showNotification("Grievance filed successfully!", "success");
      setTitle("");
      setDescription("");
      setIpfsHash("");
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

              {/* Mock grievance cards */}
              {[1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30 hover:border-orange-400/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {i === 1
                          ? "Street Light Not Working"
                          : "Noise Complaint"}
                      </h3>
                      <p className="text-orange-200 text-sm mb-3">
                        {i === 1
                          ? "The street light at Main St & 5th Ave has been out for 3 days"
                          : "Construction noise exceeding permitted hours"}
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-orange-300">
                          Filed:{" "}
                          {new Date(
                            Date.now() - i * 86400000
                          ).toLocaleDateString()}
                        </span>
                        <span className="text-orange-300">
                          Case #{1000 + i}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        i === 1
                          ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                          : "bg-green-500/20 text-green-300 border border-green-500/30"
                      }`}
                    >
                      {i === 1 ? "Under Review" : "Resolved"}
                    </div>
                  </div>

                  {i === 1 && (
                    <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
                      <p className="text-orange-200 text-sm flex items-center gap-2">
                        <FaUserTie className="text-orange-400" />
                        <span>Assigned to: Resolver #42 (John Doe)</span>
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === "all" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaGavel className="text-orange-400" />
                All Public Grievances
              </h2>

              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
                <p className="text-orange-200 text-center">
                  {grievanceCount && Number(grievanceCount) > 0
                    ? `${grievanceCount.toString()} total grievances filed`
                    : "No grievances filed yet"}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
