"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatEther, parseEther } from "viem";
import { useDeFiBank } from "@/hooks/useDeFiBank";
import { useDeFiToken } from "@/hooks/useDeFiToken";
import { contractAddresses } from "@/contracts/addresses";
import {
  FaTimes,
  FaUniversity,
  FaCoins,
  FaHandHoldingUsd,
  FaWallet,
  FaChartLine,
  FaPercent,
  FaPiggyBank,
  FaArrowUp,
  FaArrowDown,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useAccount } from "wagmi";

interface BankPanelProps {
  onClose: () => void;
  balance: bigint | undefined;
  bankDeposit: readonly [bigint, bigint] | undefined;
}

export function BankPanel({ onClose, balance, bankDeposit }: BankPanelProps) {
  const { isConnected } = useAccount();
  const {
    deposit: makeDeposit,
    withdraw,
    requestLoan,
    isPending: bankPending,
  } = useDeFiBank();
  const { approve, isPending: tokenPending } = useDeFiToken();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [collateralAmount, setCollateralAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "loans">("overview");

  const handleApprove = async () => {
    if (!depositAmount || !isConnected) return;
    try {
      await approve(contractAddresses.DeFiBank, parseEther(depositAmount));
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || !makeDeposit || !isConnected) return;
    try {
      await makeDeposit(parseEther(depositAmount));
      setDepositAmount("");
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdraw || !isConnected) return;
    try {
      await withdraw(parseEther(withdrawAmount));
      setWithdrawAmount("");
    } catch (error) {
      console.error("Withdrawal failed:", error);
    }
  };

  const handleRequestLoan = async () => {
    if (!loanAmount || !collateralAmount || !isConnected) return;
    try {
      await requestLoan(parseEther(loanAmount), parseEther(collateralAmount));
      setLoanAmount("");
      setCollateralAmount("");
    } catch (error) {
      console.error("Loan request failed:", error);
    }
  };

  const walletBalance = balance ? parseFloat(formatEther(balance)) : 0;
  const depositedBalance =
    bankDeposit && Array.isArray(bankDeposit) && bankDeposit[0]
      ? parseFloat(formatEther(bankDeposit[0] as bigint))
      : 0;
  const totalValue = walletBalance + depositedBalance;
  const interestEarned = depositedBalance * 0.05;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto z-50"
      >
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl rounded-3xl border-2 border-blue-500/30 shadow-2xl shadow-blue-500/20">
          {/* Animated background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl animate-pulse" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

          {/* Header */}
          <div className="relative flex items-center justify-between p-6 border-b border-gray-700/50">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-400/30">
                <FaUniversity className="text-3xl text-blue-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  DeFi Bank Tower
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Decentralized Banking • Powered by Sepolia
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-xl transition-all hover:rotate-90 duration-300 group"
            >
              <FaTimes className="text-gray-400 group-hover:text-white text-2xl transition-colors" />
            </button>
          </div>

          {/* Content */}
          <div className="relative p-6 space-y-6">
            {/* Portfolio Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Total Value */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur group-hover:blur-lg transition-all" />
                <div className="relative bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <FaChartLine className="text-blue-400 text-xl" />
                    <div className="text-green-400 text-xs font-semibold flex items-center gap-1">
                      <FaArrowUp className="text-xs" />
                      5.0%
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mb-1">TOTAL VALUE</div>
                  <div className="text-xl font-bold text-white">
                    {totalValue.toFixed(4)}
                  </div>
                  <div className="text-xs text-gray-500">NEO</div>
                </div>
              </div>

              {/* Wallet */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur group-hover:blur-lg transition-all" />
                <div className="relative bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-xl p-4">
                  <FaWallet className="text-green-400 text-xl mb-2" />
                  <div className="text-xs text-gray-400 mb-1">WALLET</div>
                  <div className="text-xl font-bold text-white">
                    {walletBalance.toFixed(4)}
                  </div>
                  <div className="text-xs text-gray-500">Available</div>
                </div>
              </div>

              {/* Deposited */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur group-hover:blur-lg transition-all" />
                <div className="relative bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-xl p-4">
                  <FaPiggyBank className="text-purple-400 text-xl mb-2" />
                  <div className="text-xs text-gray-400 mb-1">DEPOSITED</div>
                  <div className="text-xl font-bold text-white">
                    {depositedBalance.toFixed(4)}
                  </div>
                  <div className="text-xs text-gray-500">Earning</div>
                </div>
              </div>

              {/* APY */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl blur group-hover:blur-lg transition-all" />
                <div className="relative bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-xl p-4">
                  <FaPercent className="text-orange-400 text-xl mb-2" />
                  <div className="text-xs text-gray-400 mb-1">APY</div>
                  <div className="text-xl font-bold text-white">5.00%</div>
                  <div className="text-xs text-gray-500">
                    +{interestEarned.toFixed(4)}/yr
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-gray-800/50 p-1 rounded-xl border border-gray-700/50">
              {(["overview", "loans"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all capitalize ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Wallet Connection Prompt */}
            {!isConnected && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <FaExclamationTriangle className="text-yellow-400 text-xl flex-shrink-0" />
                  <div>
                    <p className="text-yellow-200 font-semibold">
                      Connect your wallet
                    </p>
                    <p className="text-yellow-300/70 text-xs mt-0.5">
                      Click &ldquo;Connect Wallet&rdquo; in the top right to
                      access banking services
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {/* Deposit & Withdraw Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Deposit */}
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <FaArrowDown className="text-green-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">
                          Deposit
                        </h3>
                      </div>
                      <div className="space-y-3">
                        <input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="0.00"
                          disabled={!isConnected}
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={handleApprove}
                            disabled={
                              !isConnected || !depositAmount || tokenPending
                            }
                            className="py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {tokenPending ? "Approving..." : "1. Approve"}
                          </button>
                          <button
                            onClick={handleDeposit}
                            disabled={
                              !isConnected || !depositAmount || bankPending
                            }
                            className="py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {bankPending ? "Depositing..." : "2. Deposit"}
                          </button>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                          <p className="text-xs text-gray-400 flex items-start gap-2">
                            <FaCheckCircle className="text-blue-400 mt-0.5 flex-shrink-0" />
                            <span>
                              Approve first, then deposit to earn 5% APY
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Withdraw */}
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                          <FaArrowUp className="text-orange-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">
                          Withdraw
                        </h3>
                      </div>
                      <div className="space-y-3">
                        <input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="0.00"
                          disabled={!isConnected}
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        />
                        <button
                          onClick={handleWithdraw}
                          disabled={
                            !isConnected || !withdrawAmount || bankPending
                          }
                          className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {bankPending ? "Withdrawing..." : "Withdraw"}
                        </button>
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                          <p className="text-xs text-gray-400 flex items-start gap-2">
                            <FaClock className="text-orange-400 mt-0.5 flex-shrink-0" />
                            <span>Withdraw anytime with no lock-up period</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Stats */}
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <FaChartLine className="text-blue-400" />
                      Performance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                        <div className="text-xs text-gray-400 mb-1">
                          30-Day Earnings
                        </div>
                        <div className="text-lg font-bold text-green-400">
                          +{((depositedBalance * 0.05) / 12).toFixed(4)} NEO
                        </div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                        <div className="text-xs text-gray-400 mb-1">
                          365-Day Earnings
                        </div>
                        <div className="text-lg font-bold text-green-400">
                          +{interestEarned.toFixed(4)} NEO
                        </div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                        <div className="text-xs text-gray-400 mb-1">Status</div>
                        <div className="text-lg font-bold text-blue-400 flex items-center gap-2">
                          <FaCheckCircle className="text-green-400 text-sm" />
                          Active
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "loans" && (
                <motion.div
                  key="loans"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <FaHandHoldingUsd className="text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          Request Loan
                        </h3>
                        <p className="text-xs text-gray-400">
                          Borrow against collateral
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-2 font-medium">
                          Loan Amount (NEO)
                        </label>
                        <input
                          type="number"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          placeholder="0.00"
                          disabled={!isConnected}
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-2 font-medium">
                          Collateral Amount (NEO)
                        </label>
                        <input
                          type="number"
                          value={collateralAmount}
                          onChange={(e) => setCollateralAmount(e.target.value)}
                          placeholder="0.00"
                          disabled={!isConnected}
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleRequestLoan}
                      disabled={
                        !isConnected ||
                        !loanAmount ||
                        !collateralAmount ||
                        bankPending
                      }
                      className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bankPending ? "Requesting..." : "Request Loan"}
                    </button>

                    {/* Loan Info */}
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">
                          Min. Collateral
                        </div>
                        <div className="text-sm font-bold text-purple-400">
                          150%
                        </div>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">
                          Interest
                        </div>
                        <div className="text-sm font-bold text-purple-400">
                          5% APY
                        </div>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">
                          Duration
                        </div>
                        <div className="text-sm font-bold text-purple-400">
                          365d
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                      <p className="text-xs text-gray-400 flex items-start gap-2">
                        <FaExclamationTriangle className="text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span>
                          Collateral locked until repaid. May be liquidated if
                          ratio falls below 150%
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Empty state */}
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 backdrop-blur-sm text-center">
                    <FaCoins className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-gray-400 mb-1">
                      No Active Loans
                    </h4>
                    <p className="text-xs text-gray-500">
                      Request a loan to see it here
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </>
  );
}
