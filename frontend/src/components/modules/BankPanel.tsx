"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { formatEther, parseEther } from "viem";
import { useDeFiBank } from "@/hooks/useDeFiBank";
import {
  FaTimes,
  FaUniversity,
  FaCoins,
  FaHandHoldingUsd,
} from "react-icons/fa";
import { useAccount } from "wagmi";

interface BankPanelProps {
  onClose: () => void;
  balance: bigint | undefined;
  bankDeposit: any;
}

export function BankPanel({ onClose, balance, bankDeposit }: BankPanelProps) {
  const { address } = useAccount();
  const { deposit, withdraw } = useDeFiBank();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw" | "loan">(
    "deposit"
  );

  const handleDeposit = () => {
    if (!depositAmount || !deposit) return;
    deposit({ args: [parseEther(depositAmount)] });
    setDepositAmount("");
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || !withdraw) return;
    withdraw({ args: [parseEther(withdrawAmount)] });
    setWithdrawAmount("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-2xl z-50"
    >
      {/* Holographic panel */}
      <div className="relative bg-gradient-to-br from-blue-900/90 via-blue-800/90 to-cyan-900/90 backdrop-blur-xl rounded-2xl border-2 border-blue-400/50 shadow-2xl shadow-blue-500/50 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 animate-pulse" />

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 animate-pulse" />

        {/* Header */}
        <div className="relative flex items-center justify-between p-6 border-b border-blue-400/30">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/30 rounded-xl border border-blue-400/50">
              <FaUniversity className="text-2xl text-blue-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">DeFi Bank Tower</h2>
              <p className="text-blue-300 text-sm">
                Decentralized Banking Services
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all hover:rotate-90 duration-300"
          >
            <FaTimes className="text-white text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="relative p-6 space-y-6">
          {/* Balance cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-blue-400/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaCoins className="text-yellow-400" />
                <span className="text-sm text-blue-200">Wallet Balance</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {balance ? `${formatEther(balance).slice(0, 8)} NEO` : "0 NEO"}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-green-400/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaUniversity className="text-green-400" />
                <span className="text-sm text-green-200">Bank Deposit</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {bankDeposit && Array.isArray(bankDeposit) && bankDeposit[0]
                  ? `${formatEther(bankDeposit[0] as bigint).slice(0, 8)} NEO`
                  : "0 NEO"}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-black/30 p-1 rounded-lg">
            {(["deposit", "withdraw", "loan"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                    : "text-blue-300 hover:bg-white/5"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Deposit Tab */}
          {activeTab === "deposit" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-blue-200 mb-2">
                  Amount to Deposit
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-black/30 border border-blue-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                />
              </div>
              <button
                onClick={handleDeposit}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
              >
                Deposit to Bank
              </button>
            </motion.div>
          )}

          {/* Withdraw Tab */}
          {activeTab === "withdraw" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-green-200 mb-2">
                  Amount to Withdraw
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-black/30 border border-green-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
                />
              </div>
              <button
                onClick={handleWithdraw}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105"
              >
                Withdraw from Bank
              </button>
            </motion.div>
          )}

          {/* Loan Tab */}
          {activeTab === "loan" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="text-center py-8">
                <FaHandHoldingUsd className="text-5xl text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Loans Coming Soon
                </h3>
                <p className="text-blue-300">
                  Collateralized lending will be available in the next update
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
