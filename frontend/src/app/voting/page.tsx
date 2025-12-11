"use client";

import { useState, useEffect } from "react";
import { useAccount, useBlockNumber } from "wagmi";
import { useRouter } from "next/navigation";
import { useVoting } from "@/hooks/useVoting";
import { useIdentityRegistry } from "@/hooks/useIdentityRegistry";
import { contractAddresses } from "@/contracts/addresses";
import { VotingABI } from "@/contracts/abis";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaVoteYea,
  FaWallet,
  FaCheck,
  FaTimes,
  FaChartLine,
  FaUsers,
  FaClock,
  FaSpinner,
  FaFire,
  FaPlusCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglass,
  FaInfoCircle,
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

export default function VotingPage() {
  const { address, isConnected } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const router = useRouter();

  // Get user's DID
  const { useUserDIDs } = useIdentityRegistry();
  const { data: userDID } = useUserDIDs(address);
  const userDid = userDID && typeof userDID === "string" ? userDID : "";

  const [activeTab, setActiveTab] = useState<
    "proposals" | "create" | "history"
  >("proposals");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Create Proposal Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const {
    useProposalCount,
    createProposal,
    vote,
    isPending,
    isConfirming,
    isSuccess,
  } = useVoting();
  const { data: proposalCount } = useProposalCount();

  // State to store fetched proposals
  interface Proposal {
    id: number;
    title: string;
    description: string;
    proposer: string;
    startTime: number;
    endTime: number;
    yesVotes: number;
    noVotes: number;
    status: string;
    hasVoted: boolean;
  }

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoadingProposals, setIsLoadingProposals] = useState(false);

  // Fetch proposals from blockchain when proposalCount changes
  useEffect(() => {
    const fetchProposals = async () => {
      if (!proposalCount || Number(proposalCount) === 0) {
        setProposals([]);
        return;
      }

      setIsLoadingProposals(true);
      const count = Number(proposalCount);
      const fetchedProposals: Proposal[] = [];

      // Fetch proposals using readContract (in production, use multicall for efficiency)
      for (let i = 1; i <= Math.min(count, 20); i++) {
        try {
          const { readContract } = await import("wagmi/actions");
          const { config } = await import("@/config/wagmi");

          const proposalData = (await readContract(config, {
            address: contractAddresses.Voting,
            abi: VotingABI,
            functionName: "getProposal",
            args: [BigInt(i)],
          })) as [
            bigint,
            string,
            string,
            string,
            bigint,
            bigint,
            bigint,
            bigint,
            number
          ];

          const [
            id,
            title,
            description,
            proposer,
            startTime,
            endTime,
            yesVotes,
            noVotes,
            statusNum,
          ] = proposalData;

          const statusMap: Record<number, string> = {
            0: "pending",
            1: "active",
            2: "passed",
            3: "failed",
            4: "executed",
          };

          fetchedProposals.push({
            id: Number(id),
            title: title || `Proposal #${i}`,
            description: description || "No description provided",
            proposer: proposer,
            startTime: Number(startTime) * 1000,
            endTime: Number(endTime) * 1000,
            yesVotes: Number(yesVotes),
            noVotes: Number(noVotes),
            status: statusMap[statusNum] || "pending",
            hasVoted: false,
          });
        } catch (error) {
          console.error(`Error fetching proposal ${i}:`, error);
        }
      }

      setProposals(fetchedProposals);
      setIsLoadingProposals(false);
    };

    fetchProposals();
  }, [proposalCount, isSuccess]);

  const totalProposals = proposals.length;
  const activeProposals = proposals.filter((p) => p.status === "active").length;
  const userVotes = proposals.filter((p) => p.hasVoted).length;
  const participationRate =
    totalProposals > 0
      ? ((userVotes / totalProposals) * 100).toFixed(1)
      : "0.0";

  // Notification helper
  const showNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setNotification({ message, type });
  };

  // Show success notification after blockchain confirmation
  useEffect(() => {
    if (isSuccess) {
      showNotification("Proposal created successfully!", "success");
      setTitle("");
      setDescription("");
      setActiveTab("proposals");
    }
  }, [isSuccess]);

  // Handle Create Proposal
  const handleCreateProposal = async () => {
    if (!title || !description || !userDid || !isConnected) {
      showNotification(
        "Please fill in all fields and ensure you have a registered DID.",
        "error"
      );
      return;
    }
    try {
      createProposal(userDid, title, description);
      // Success will be shown via useEffect watching isSuccess
    } catch (error) {
      console.error("Failed to create proposal:", error);
      showNotification("Failed to create proposal. Please try again.", "error");
    }
  };

  // Handle Vote
  const handleVote = async (proposalId: number, support: boolean) => {
    if (!isConnected) return;
    try {
      vote(BigInt(proposalId), support);
      // Success will be shown via useEffect watching isSuccess
    } catch (error) {
      console.error("Failed to vote:", error);
      showNotification("Failed to submit vote. Please try again.", "error");
    }
  };

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
          className="max-w-md w-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-3xl border-2 border-purple-500/30 p-8 text-center shadow-2xl shadow-purple-500/20"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"></div>
            <FaWallet className="w-24 h-24 text-purple-500 mx-auto relative animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Connect Your Wallet
          </h2>
          <p className="text-gray-400 mb-6 text-lg">
            Please connect your wallet to participate in governance
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
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 backdrop-blur-xl rounded-xl border border-purple-500/30 hover:border-purple-500/50 text-white transition-all group"
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
      <div className="bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 border-b border-gray-800 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                  <FaVoteYea className="text-3xl text-purple-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    Governance Dashboard
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Shape the future of NeoCity through decentralized voting
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
            title="TOTAL PROPOSALS"
            value={`${totalProposals}`}
            subtitle="All Time"
            icon={FaChartLine}
            gradient="from-purple-500/20 to-purple-600/20"
            trend={{ value: "3 this month", positive: true }}
          />
          <StatsCard
            title="ACTIVE VOTING"
            value={`${activeProposals}`}
            subtitle="Ongoing"
            icon={FaFire}
            gradient="from-pink-500/20 to-pink-600/20"
          />
          <StatsCard
            title="YOUR VOTES"
            value={`${userVotes}`}
            subtitle={`${participationRate}% Participation`}
            icon={FaCheckCircle}
            gradient="from-blue-500/20 to-blue-600/20"
          />
          <StatsCard
            title="VOTING POWER"
            value="1.0"
            subtitle="Based on NEO holdings"
            icon={FaUsers}
            gradient="from-green-500/20 to-green-600/20"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-800 overflow-x-auto">
          {[
            { key: "proposals", label: "Active Proposals" },
            { key: "create", label: "Create Proposal" },
            { key: "history", label: "History" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-6 py-3 font-semibold transition-all relative capitalize whitespace-nowrap ${
                activeTab === tab.key
                  ? "text-purple-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeVotingTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* ACTIVE PROPOSALS TAB */}
          {activeTab === "proposals" && (
            <motion.div
              key="proposals"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {isLoadingProposals ? (
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-12 backdrop-blur-xl">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-300 text-center">
                      Loading proposals from blockchain...
                    </p>
                  </div>
                </div>
              ) : proposals.length > 0 ? (
                proposals.map((proposal) => {
                  const totalVotes = proposal.yesVotes + proposal.noVotes;
                  const yesPercent =
                    totalVotes > 0 ? (proposal.yesVotes / totalVotes) * 100 : 0;
                  const timeLeft = Math.max(0, proposal.endTime - Date.now());
                  const daysLeft = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
                  const hoursLeft = Math.floor(
                    (timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
                  );

                  return (
                    <div
                      key={proposal.id}
                      className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6 backdrop-blur-xl hover:border-purple-500/50 transition-all"
                    >
                      {/* Proposal Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-semibold text-purple-300">
                              #{proposal.id}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                proposal.status === "active"
                                  ? "bg-green-500/20 border border-green-500/30 text-green-300"
                                  : "bg-gray-500/20 border border-gray-500/30 text-gray-300"
                              }`}
                            >
                              {proposal.status.toUpperCase()}
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">
                            {proposal.title}
                          </h3>
                          <p className="text-gray-400 text-sm leading-relaxed">
                            {proposal.description}
                          </p>
                        </div>
                      </div>

                      {/* Proposer Info */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <FaUsers className="text-purple-400" />
                        <span>Proposed by {proposal.proposer}</span>
                      </div>

                      {/* Voting Progress */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Voting Progress</span>
                          <span className="text-white font-semibold">
                            {totalVotes.toLocaleString()} votes
                          </span>
                        </div>
                        <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${yesPercent}%` }}
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400"
                          />
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${100 - yesPercent}%` }}
                            className="absolute right-0 top-0 h-full bg-gradient-to-r from-red-400 to-red-500"
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <FaCheckCircle className="text-green-400" />
                            <span className="text-green-400 font-semibold">
                              {yesPercent.toFixed(1)}% Yes
                            </span>
                            <span className="text-gray-500">
                              ({proposal.yesVotes.toLocaleString()})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">
                              ({proposal.noVotes.toLocaleString()})
                            </span>
                            <span className="text-red-400 font-semibold">
                              {(100 - yesPercent).toFixed(1)}% No
                            </span>
                            <FaTimesCircle className="text-red-400" />
                          </div>
                        </div>
                      </div>

                      {/* Time Left */}
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 bg-gray-800/50 rounded-lg px-4 py-2">
                        <FaClock className="text-blue-400" />
                        <span>
                          {daysLeft > 0
                            ? `${daysLeft} days, ${hoursLeft} hours remaining`
                            : `${hoursLeft} hours remaining`}
                        </span>
                      </div>

                      {/* Vote Buttons */}
                      {!proposal.hasVoted ? (
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => handleVote(proposal.id, true)}
                            disabled={isPending}
                            className="py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isPending ? (
                              <>
                                <FaSpinner className="animate-spin" />
                                Voting...
                              </>
                            ) : (
                              <>
                                <FaCheck /> Vote Yes
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleVote(proposal.id, false)}
                            disabled={isPending}
                            className="py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isPending ? (
                              <>
                                <FaSpinner className="animate-spin" />
                                Voting...
                              </>
                            ) : (
                              <>
                                <FaTimes /> Vote No
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
                          <FaCheckCircle className="text-blue-400 text-xl flex-shrink-0" />
                          <div className="text-sm text-gray-300">
                            <p className="font-semibold">
                              You have already voted on this proposal
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                              Thank you for participating in governance!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-gray-800">
                  <FaHourglass className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400 mb-2">
                    No Active Proposals
                  </h3>
                  <p className="text-gray-500">
                    Be the first to create a proposal and shape NeoCity&apos;s
                    future!
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* CREATE PROPOSAL TAB */}
          {activeTab === "create" && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-8 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <FaPlusCircle className="text-purple-400 text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Create New Proposal
                    </h2>
                    <p className="text-sm text-gray-400">
                      Submit your idea for community voting
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-medium">
                      Proposal Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Upgrade City Infrastructure"
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-medium">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide detailed information about your proposal..."
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                    />
                  </div>

                  {/* DID Display */}
                  {userDid && (
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                      <label className="block text-sm text-gray-400 mb-2 font-medium">
                        Your DID
                      </label>
                      <div className="text-sm text-gray-300 font-mono break-all">
                        {userDid}
                      </div>
                    </div>
                  )}

                  {!userDid && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <FaInfoCircle className="text-yellow-400 mt-0.5 flex-shrink-0" />
                        <p className="text-yellow-200 text-sm">
                          ⚠️ You need a registered DID to create proposals.
                          Please register your identity first.
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleCreateProposal}
                    disabled={
                      !title ||
                      !description ||
                      !userDid ||
                      isPending ||
                      isConfirming
                    }
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isPending || isConfirming ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        {isPending
                          ? "Sending to Blockchain..."
                          : "Confirming Transaction..."}
                      </>
                    ) : (
                      <>
                        <FaPlusCircle /> Create Proposal
                      </>
                    )}
                  </button>

                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <FaInfoCircle className="text-purple-400 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-gray-300">
                        <p className="font-semibold mb-1">
                          Proposal Guidelines
                        </p>
                        <ul className="text-gray-400 space-y-1">
                          <li>• Be clear and concise in your proposal title</li>
                          <li>
                            • Provide detailed rationale and expected outcomes
                          </li>
                          <li>• Standard voting period is 7 days</li>
                          <li>• Proposals require majority approval to pass</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* HISTORY TAB */}
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="text-center py-16 bg-gray-900/50 rounded-2xl border border-gray-800"
            >
              <FaClock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">
                Voting History
              </h3>
              <p className="text-gray-500">
                Your voting history will appear here
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
