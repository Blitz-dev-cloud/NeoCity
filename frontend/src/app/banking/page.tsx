"use client";

import { useState, useEffect } from "react";
import { formatEther, parseEther } from "viem";
import { useAccount, useBlockNumber } from "wagmi";
import { useRouter } from "next/navigation";
import { useDeFiBank } from "@/hooks/useDeFiBank";
import { useDeFiToken } from "@/hooks/useDeFiToken";
import { contractAddresses } from "@/contracts/addresses";
import {
  FaUniversity,
  FaWallet,
  FaPiggyBank,
  FaPercent,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaHistory,
  FaHandHoldingUsd,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaLock,
  FaUnlock,
  FaChartBar,
  FaChartPie,
  FaTrophy,
  FaFire,
  FaBolt,
  FaInfoCircle,
  FaArrowLeft,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Transaction type for history
interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "loan" | "interest";
  amount: string;
  timestamp: Date;
  status: "success" | "pending" | "failed";
  hash?: string;
}

// Notification component
function Notification({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) {
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

  const icon =
    type === "success" ? (
      <FaCheckCircle className="text-green-400" />
    ) : type === "error" ? (
      <FaExclamationTriangle className="text-red-400" />
    ) : (
      <FaInfoCircle className="text-blue-400" />
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-4 right-4 z-50 bg-gradient-to-r ${bgColor} border backdrop-blur-xl rounded-xl p-4 shadow-2xl max-w-md`}
    >
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1">
          <p className="text-white font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}

// Stats Card component
function StatsCard({
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
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl group-hover:blur-2xl transition-all`}
      />
      <div
        className={`relative bg-gradient-to-br ${gradient} border border-opacity-30 rounded-2xl p-6 backdrop-blur-xl hover:border-opacity-50 transition-all`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-white/10 rounded-xl`}>
            <Icon className="text-2xl" />
          </div>
          {trend && (
            <div
              className={`text-sm font-semibold flex items-center gap-1 ${
                trend.positive ? "text-green-400" : "text-red-400"
              }`}
            >
              {trend.positive ? (
                <FaArrowUp className="text-xs" />
              ) : (
                <FaArrowDown className="text-xs" />
              )}
              {trend.value}
            </div>
          )}
        </div>
        <div className="text-sm text-gray-300 mb-2">{title}</div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-gray-400">{subtitle}</div>
      </div>
    </motion.div>
  );
}

export default function BankingDashboard() {
  const { address, isConnected } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const router = useRouter();

  // State management
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [collateralAmount, setCollateralAmount] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "loans" | "history" | "analytics"
  >("overview");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isApproved, setIsApproved] = useState(false);

  // Hooks
  const {
    deposit: makeDeposit,
    withdraw,
    requestLoan,
    isPending: bankPending,
    useDeposit,
  } = useDeFiBank();

  const { useBalance, approve, isPending: tokenPending } = useDeFiToken();

  const { data: balance } = useBalance(address);
  const { data: bankDeposit } = useDeposit(address);

  // Calculate balances
  const walletBalance =
    balance && typeof balance === "bigint"
      ? parseFloat(formatEther(balance))
      : 0;
  const depositedBalance =
    bankDeposit && Array.isArray(bankDeposit) && bankDeposit[0]
      ? parseFloat(formatEther(bankDeposit[0] as bigint))
      : 0;
  const totalValue = walletBalance + depositedBalance;
  const interestEarned = depositedBalance * 0.05;
  const dailyEarnings = interestEarned / 365;
  const monthlyEarnings = interestEarned / 12;

  // Notification helper
  const showNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setNotification({ message, type });
  };

  // Handle Approve
  const handleApprove = async () => {
    if (!depositAmount || !isConnected) return;
    try {
      await approve(contractAddresses.DeFiBank, parseEther(depositAmount));
      setIsApproved(true);
      showNotification("Approval successful! You can now deposit.", "success");
    } catch (error) {
      console.error("Approval failed:", error);
      showNotification("Approval failed. Please try again.", "error");
    }
  };

  // Handle Deposit
  const handleDeposit = async () => {
    if (!depositAmount || !makeDeposit || !isConnected) return;
    try {
      await makeDeposit(parseEther(depositAmount));
      const newTx: Transaction = {
        id: Date.now().toString(),
        type: "deposit",
        amount: depositAmount,
        timestamp: new Date(),
        status: "success",
      };
      setTransactions([newTx, ...transactions]);
      showNotification(
        `Deposited ${depositAmount} NEO successfully!`,
        "success"
      );
      setDepositAmount("");
      setIsApproved(false);
    } catch (error) {
      console.error("Deposit failed:", error);
      showNotification("Deposit failed. Please try again.", "error");
    }
  };

  // Handle Withdraw
  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdraw || !isConnected) return;
    try {
      await withdraw(parseEther(withdrawAmount));
      const newTx: Transaction = {
        id: Date.now().toString(),
        type: "withdraw",
        amount: withdrawAmount,
        timestamp: new Date(),
        status: "success",
      };
      setTransactions([newTx, ...transactions]);
      showNotification(
        `Withdrawn ${withdrawAmount} NEO successfully!`,
        "success"
      );
      setWithdrawAmount("");
    } catch (error) {
      console.error("Withdrawal failed:", error);
      showNotification("Withdrawal failed. Please try again.", "error");
    }
  };

  // Handle Loan Request
  const handleRequestLoan = async () => {
    if (!loanAmount || !collateralAmount || !isConnected) return;
    try {
      await requestLoan(parseEther(loanAmount), parseEther(collateralAmount));
      const newTx: Transaction = {
        id: Date.now().toString(),
        type: "loan",
        amount: loanAmount,
        timestamp: new Date(),
        status: "success",
      };
      setTransactions([newTx, ...transactions]);
      showNotification(
        `Loan of ${loanAmount} NEO requested with ${collateralAmount} NEO collateral!`,
        "success"
      );
      setLoanAmount("");
      setCollateralAmount("");
    } catch (error) {
      console.error("Loan request failed:", error);
      showNotification("Loan request failed. Please try again.", "error");
    }
  };

  // Auto-refresh on new blocks
  useEffect(() => {
    if (blockNumber) {
      // Trigger balance refresh
    }
  }, [blockNumber]);

  // Not connected state
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-3xl border-2 border-blue-500/30 p-8 text-center shadow-2xl shadow-blue-500/20"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
            <FaWallet className="w-24 h-24 text-blue-500 mx-auto relative animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Connect Your Wallet
          </h2>
          <p className="text-gray-400 mb-6 text-lg">
            Please connect your wallet to access DeFi banking services
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
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 backdrop-blur-xl rounded-xl border border-blue-500/30 hover:border-blue-500/50 text-white transition-all group"
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
      <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 border-b border-gray-800 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
                  <FaUniversity className="text-3xl text-blue-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    DeFi Banking Dashboard
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Manage your digital assets with decentralized finance
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
            title="TOTAL VALUE"
            value={`${totalValue.toFixed(4)}`}
            subtitle="NEO Tokens"
            icon={FaChartLine}
            gradient="from-blue-500/20 to-blue-600/20"
            trend={{ value: "5.0%", positive: true }}
          />
          <StatsCard
            title="WALLET BALANCE"
            value={`${walletBalance.toFixed(4)}`}
            subtitle="Available"
            icon={FaWallet}
            gradient="from-green-500/20 to-green-600/20"
          />
          <StatsCard
            title="DEPOSITED"
            value={`${depositedBalance.toFixed(4)}`}
            subtitle="Earning Interest"
            icon={FaPiggyBank}
            gradient="from-purple-500/20 to-purple-600/20"
          />
          <StatsCard
            title="ANNUAL APY"
            value="5.00%"
            subtitle={`≈ ${interestEarned.toFixed(4)} NEO/year`}
            icon={FaPercent}
            gradient="from-orange-500/20 to-orange-600/20"
          />
        </div>

        {/* Quick Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <FaBolt className="text-yellow-400" />
              <span className="text-xs text-gray-400">Daily Earnings</span>
            </div>
            <div className="text-lg font-bold text-white">
              +{dailyEarnings.toFixed(6)} NEO
            </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <FaFire className="text-orange-400" />
              <span className="text-xs text-gray-400">Monthly Earnings</span>
            </div>
            <div className="text-lg font-bold text-white">
              +{monthlyEarnings.toFixed(4)} NEO
            </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <FaTrophy className="text-purple-400" />
              <span className="text-xs text-gray-400">Portfolio Rank</span>
            </div>
            <div className="text-lg font-bold text-white">Top 10%</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <FaClock className="text-blue-400" />
              <span className="text-xs text-gray-400">Member Since</span>
            </div>
            <div className="text-lg font-bold text-white">Genesis</div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-800 overflow-x-auto">
          {["overview", "loans", "history", "analytics"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-6 py-3 font-semibold transition-all relative capitalize whitespace-nowrap ${
                activeTab === tab
                  ? "text-blue-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Deposit */}
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-green-500/20 rounded-xl">
                      <FaArrowDown className="text-green-400 text-xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Deposit</h2>
                      <p className="text-sm text-gray-400">
                        Earn 5% APY on deposits
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2 font-medium">
                        Amount (NEO)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                        />
                        <button
                          onClick={() =>
                            setDepositAmount(walletBalance.toString())
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                        >
                          MAX
                        </button>
                      </div>
                    </div>

                    {!isApproved ? (
                      <button
                        onClick={handleApprove}
                        disabled={!depositAmount || tokenPending}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {tokenPending ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <FaLock /> Step 1: Approve
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleDeposit}
                        disabled={!depositAmount || bankPending}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {bankPending ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            Depositing...
                          </>
                        ) : (
                          <>
                            <FaUnlock /> Step 2: Deposit
                          </>
                        )}
                      </button>
                    )}

                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-gray-300">
                          <p className="font-semibold mb-1">Secure Deposits</p>
                          <p className="text-gray-400">
                            Your funds are secured by smart contracts. Earn
                            interest automatically.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Withdraw */}
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-orange-500/20 rounded-xl">
                      <FaArrowUp className="text-orange-400 text-xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Withdraw
                      </h2>
                      <p className="text-sm text-gray-400">No lock-up period</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2 font-medium">
                        Amount (NEO)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        />
                        <button
                          onClick={() =>
                            setWithdrawAmount(depositedBalance.toString())
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                        >
                          MAX
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleWithdraw}
                      disabled={!withdrawAmount || bankPending}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {bankPending ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Withdrawing...
                        </>
                      ) : (
                        <>
                          <FaArrowUp /> Withdraw Funds
                        </>
                      )}
                    </button>

                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <FaClock className="text-orange-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-gray-300">
                          <p className="font-semibold mb-1">
                            Instant Withdrawals
                          </p>
                          <p className="text-gray-400">
                            Withdraw anytime with no penalties or waiting
                            periods.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Section */}
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <FaChartLine className="text-blue-400 text-xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Performance Overview
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-2">
                      Daily Earnings
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                      +{dailyEarnings.toFixed(6)} NEO
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Per 24 hours
                    </div>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-2">
                      Monthly Earnings
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                      +{monthlyEarnings.toFixed(4)} NEO
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Per 30 days
                    </div>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-2">
                      Annual Earnings
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                      +{interestEarned.toFixed(4)} NEO
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Per year</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* LOANS TAB */}
          {activeTab === "loans" && (
            <motion.div
              key="loans"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <FaHandHoldingUsd className="text-purple-400 text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Request Loan
                    </h2>
                    <p className="text-sm text-gray-400">
                      Borrow against your collateral
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-medium">
                      Loan Amount (NEO)
                    </label>
                    <input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-medium">
                      Collateral Amount (NEO)
                    </label>
                    <input
                      type="number"
                      value={collateralAmount}
                      onChange={(e) => setCollateralAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={handleRequestLoan}
                  disabled={!loanAmount || !collateralAmount || bankPending}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {bankPending ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaHandHoldingUsd /> Request Loan
                    </>
                  )}
                </button>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <FaInfoCircle className="text-purple-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-gray-300">
                      <p className="font-semibold mb-1">Loan Terms</p>
                      <ul className="text-gray-400 space-y-1">
                        <li>• Collateral ratio: 150% minimum</li>
                        <li>• Interest rate: 3% annually</li>
                        <li>• No prepayment penalties</li>
                        <li>• Liquidation at 120% collateral ratio</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loan Calculator */}
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaChartBar className="text-blue-400" />
                  Loan Calculator
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-2">
                      Max Borrowable
                    </div>
                    <div className="text-xl font-bold text-white">
                      {collateralAmount
                        ? (parseFloat(collateralAmount) / 1.5).toFixed(4)
                        : "0.0000"}{" "}
                      NEO
                    </div>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-2">
                      Interest (3% APY)
                    </div>
                    <div className="text-xl font-bold text-white">
                      {loanAmount
                        ? (parseFloat(loanAmount) * 0.03).toFixed(4)
                        : "0.0000"}{" "}
                      NEO/year
                    </div>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-2">
                      Health Factor
                    </div>
                    <div className="text-xl font-bold text-green-400">
                      {loanAmount && collateralAmount
                        ? (
                            parseFloat(collateralAmount) /
                            parseFloat(loanAmount)
                          ).toFixed(2)
                        : "∞"}
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
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <FaHistory className="text-blue-400 text-xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Transaction History
                  </h2>
                </div>

                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <FaHistory className="text-gray-600 text-4xl mx-auto mb-4" />
                    <p className="text-gray-400">No transactions yet</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Your transaction history will appear here
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-sm text-gray-400 font-semibold">
                            Type
                          </th>
                          <th className="text-left py-3 px-4 text-sm text-gray-400 font-semibold">
                            Amount
                          </th>
                          <th className="text-left py-3 px-4 text-sm text-gray-400 font-semibold">
                            Date
                          </th>
                          <th className="text-left py-3 px-4 text-sm text-gray-400 font-semibold">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx) => (
                          <tr
                            key={tx.id}
                            className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {tx.type === "deposit" ? (
                                  <FaArrowDown className="text-green-400" />
                                ) : tx.type === "withdraw" ? (
                                  <FaArrowUp className="text-orange-400" />
                                ) : (
                                  <FaHandHoldingUsd className="text-purple-400" />
                                )}
                                <span className="text-white capitalize">
                                  {tx.type}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-white font-semibold">
                              {tx.amount} NEO
                            </td>
                            <td className="py-3 px-4 text-gray-400">
                              {tx.timestamp.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  tx.status === "success"
                                    ? "bg-green-500/20 text-green-400"
                                    : tx.status === "pending"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <FaChartPie className="text-purple-400 text-2xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Portfolio Analytics
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Asset Distribution */}
                  <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-4">
                      Asset Distribution
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Wallet</span>
                          <span className="text-white font-semibold">
                            {totalValue > 0
                              ? ((walletBalance / totalValue) * 100).toFixed(1)
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                            style={{
                              width: `${
                                totalValue > 0
                                  ? (walletBalance / totalValue) * 100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Deposited</span>
                          <span className="text-white font-semibold">
                            {totalValue > 0
                              ? ((depositedBalance / totalValue) * 100).toFixed(
                                  1
                                )
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            style={{
                              width: `${
                                totalValue > 0
                                  ? (depositedBalance / totalValue) * 100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Projected Growth */}
                  <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-4">
                      Projected Growth (5% APY)
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">3 Months</span>
                        <span className="text-green-400 font-semibold">
                          +{(depositedBalance * 0.05 * 0.25).toFixed(4)} NEO
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">6 Months</span>
                        <span className="text-green-400 font-semibold">
                          +{(depositedBalance * 0.05 * 0.5).toFixed(4)} NEO
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">1 Year</span>
                        <span className="text-green-400 font-semibold">
                          +{interestEarned.toFixed(4)} NEO
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">2 Years</span>
                        <span className="text-green-400 font-semibold">
                          +{(interestEarned * 2).toFixed(4)} NEO
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <FaTrophy className="text-yellow-400 text-xl" />
                    <h3 className="text-lg font-bold text-white">Rank</h3>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    Top 10%
                  </div>
                  <div className="text-sm text-gray-400">
                    Among all depositors
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <FaFire className="text-orange-400 text-xl" />
                    <h3 className="text-lg font-bold text-white">Streak</h3>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {transactions.length} Days
                  </div>
                  <div className="text-sm text-gray-400">Active streak</div>
                </div>

                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <FaBolt className="text-blue-400 text-xl" />
                    <h3 className="text-lg font-bold text-white">Efficiency</h3>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">98%</div>
                  <div className="text-sm text-gray-400">
                    Capital utilization
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
