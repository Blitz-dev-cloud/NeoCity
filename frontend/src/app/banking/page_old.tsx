"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useDeFiToken } from "@/hooks/useDeFiToken";
import { useDeFiBank } from "@/hooks/useDeFiBank";
import { parseEther, formatEther } from "viem";
import {
  FaUniversity,
  FaWallet,
  FaCoins,
  FaChartLine,
  FaHistory,
  FaPercent,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPiggyBank,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { contractAddresses } from "@/contracts/addresses";

export default function BankingDashboard() {
  const { address, isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [collateralAmount, setCollateralAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "loans" | "history">(
    "overview"
  );

  const { useBalance, approve, isPending: tokenPending } = useDeFiToken();
  const {
    useDeposit,
    deposit: makeDeposit,
    withdraw,
    requestLoan,
    isPending: bankPending,
  } = useDeFiBank();

  const { data: balance } = useBalance(address);
  const { data: depositData } = useDeposit(address);

  const handleApprove = async () => {
    if (!depositAmount) return;
    try {
      await approve(contractAddresses.DeFiBank, parseEther(depositAmount));
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount) return;
    try {
      await makeDeposit(parseEther(depositAmount));
      setDepositAmount("");
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) return;
    try {
      await withdraw(parseEther(withdrawAmount));
      setWithdrawAmount("");
    } catch (error) {
      console.error("Withdrawal failed:", error);
    }
  };

  const handleRequestLoan = async () => {
    if (!loanAmount || !collateralAmount) return;
    try {
      await requestLoan(parseEther(loanAmount), parseEther(collateralAmount));
      setLoanAmount("");
      setCollateralAmount("");
    } catch (error) {
      console.error("Loan request failed:", error);
    }
  };

  const walletBalance = balance
    ? parseFloat(formatEther(balance as bigint))
    : 0;
  const depositedBalance =
    depositData && Array.isArray(depositData) && depositData[0]
      ? parseFloat(formatEther(depositData[0] as bigint))
      : 0;
  const totalValue = walletBalance + depositedBalance;
  const interestEarned = depositedBalance * 0.05;

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <div className="text-center bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-3xl p-12 shadow-2xl backdrop-blur-xl max-w-md">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black pb-20">
      <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 border-b border-gray-800 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                DeFi Banking Dashboard
              </h1>
              <p className="text-gray-400">
                Manage your digital assets with decentralized finance
              </p>
            </div>
            <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-xl px-6 py-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">
                Connected to Sepolia
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-xl hover:border-blue-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <FaChartLine className="text-blue-400 text-2xl" />
                </div>
                <div className="text-green-500 text-sm font-semibold flex items-center gap-1">
                  <FaArrowUp className="text-xs" />
                  5.0%
                </div>
              </div>
              <div className="text-sm text-gray-400 mb-2">TOTAL VALUE</div>
              <div className="text-3xl font-bold text-white mb-1">
                {totalValue.toFixed(4)}
              </div>
              <div className="text-sm text-gray-500">NEO Tokens</div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-2xl p-6 backdrop-blur-xl hover:border-green-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <FaWallet className="text-green-400 text-2xl" />
                </div>
              </div>
              <div className="text-sm text-gray-400 mb-2">WALLET BALANCE</div>
              <div className="text-3xl font-bold text-white mb-1">
                {walletBalance.toFixed(4)}
              </div>
              <div className="text-sm text-gray-500">Available</div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl hover:border-purple-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <FaPiggyBank className="text-purple-400 text-2xl" />
                </div>
              </div>
              <div className="text-sm text-gray-400 mb-2">DEPOSITED</div>
              <div className="text-3xl font-bold text-white mb-1">
                {depositedBalance.toFixed(4)}
              </div>
              <div className="text-sm text-gray-500">Earning Interest</div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
            <div className="relative bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-2xl p-6 backdrop-blur-xl hover:border-orange-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <FaPercent className="text-orange-400 text-2xl" />
                </div>
              </div>
              <div className="text-sm text-gray-400 mb-2">APY</div>
              <div className="text-3xl font-bold text-white mb-1">5.00%</div>
              <div className="text-sm text-gray-500">
                ≈ {interestEarned.toFixed(4)} NEO/year
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 border-b border-gray-800">
          {["overview", "loans", "history"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-6 py-3 font-semibold transition-all relative capitalize ${
                activeTab === tab
                  ? "text-blue-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></div>
              )}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <FaArrowDown className="text-green-400 text-xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Deposit</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-medium">
                      Amount (NEO)
                    </label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleApprove}
                      disabled={tokenPending || !depositAmount}
                      className="bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-gray-800 disabled:text-gray-600 text-blue-400 disabled:cursor-not-allowed font-semibold py-4 rounded-xl transition-all border border-blue-500/30 hover:border-blue-500/50"
                    >
                      {tokenPending ? "Approving..." : "1. Approve"}
                    </button>
                    <button
                      onClick={handleDeposit}
                      disabled={bankPending || !depositAmount}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
                    >
                      {bankPending ? "Depositing..." : "2. Deposit"}
                    </button>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-sm text-gray-400 flex items-start gap-2">
                      <FaCheckCircle className="text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>
                        Approve tokens first, then deposit to earn 5% APY. Your
                        deposits are secured by smart contracts.
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-orange-500/20 rounded-xl">
                    <FaArrowUp className="text-orange-400 text-xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Withdraw</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-medium">
                      Amount (NEO)
                    </label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleWithdraw}
                    disabled={bankPending || !withdrawAmount}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
                  >
                    {bankPending ? "Withdrawing..." : "Withdraw"}
                  </button>
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                    <p className="text-sm text-gray-400 flex items-start gap-2">
                      <FaClock className="text-orange-400 mt-0.5 flex-shrink-0" />
                      <span>
                        Withdraw your deposited funds plus accumulated interest
                        anytime. No lock-up period.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6 backdrop-blur-xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FaChartLine className="text-blue-400" />
                Performance Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <div className="text-gray-400 text-sm mb-2">
                    Estimated Earnings (30 days)
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    +{((depositedBalance * 0.05) / 12).toFixed(4)} NEO
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <div className="text-gray-400 text-sm mb-2">
                    Estimated Earnings (365 days)
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    +{interestEarned.toFixed(4)} NEO
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <div className="text-gray-400 text-sm mb-2">
                    Account Status
                  </div>
                  <div className="text-2xl font-bold text-blue-400 flex items-center gap-2">
                    <FaCheckCircle className="text-green-400" />
                    Active
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "loans" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <FaUniversity className="text-purple-400 text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Request Loan
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Borrow against your collateral
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2 font-medium">
                    Loan Amount (NEO)
                  </label>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
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
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>
              <button
                onClick={handleRequestLoan}
                disabled={bankPending || !loanAmount || !collateralAmount}
                className="mt-6 w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
              >
                {bankPending ? "Requesting..." : "Request Loan"}
              </button>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">
                    Minimum Collateral Ratio
                  </div>
                  <div className="text-xl font-bold text-purple-400">150%</div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">
                    Interest Rate
                  </div>
                  <div className="text-xl font-bold text-purple-400">
                    5% APY
                  </div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">
                    Loan Duration
                  </div>
                  <div className="text-xl font-bold text-purple-400">
                    365 Days
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-sm text-gray-400 flex items-start gap-2">
                  <FaExclamationTriangle className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span>
                    Your collateral will be locked until the loan is repaid. If
                    the collateral ratio falls below 150%, your collateral may
                    be liquidated.
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-8 backdrop-blur-xl text-center">
              <FaCoins className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">
                No Active Loans
              </h3>
              <p className="text-gray-500">
                Request a loan to see it appear here
              </p>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-2xl p-8 backdrop-blur-xl text-center">
            <FaHistory className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              No Transaction History
            </h3>
            <p className="text-gray-500">
              Your transaction history will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
