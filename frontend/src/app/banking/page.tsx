"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useDeFiToken } from "@/hooks/useDeFiToken";
import { useDeFiBank } from "@/hooks/useDeFiBank";
import { parseEther, formatEther } from "viem";
import { FaUniversity, FaWallet, FaCoins, FaArrowRight } from "react-icons/fa";
import { contractAddresses } from "@/contracts/addresses";

export default function BankingPage() {
  const { address, isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [collateralAmount, setCollateralAmount] = useState("");

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

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <FaWallet className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">
            Please connect your wallet to access banking services
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">DeFi Banking</h1>
        <p className="text-gray-400">
          Deposit, withdraw, and manage your loans
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaWallet className="text-blue-500 text-2xl" />
            <span className="text-sm text-gray-400">WALLET BALANCE</span>
          </div>
          <div className="text-3xl font-bold">
            {balance ? formatEther(balance as bigint) : "0.00"}
          </div>
          <div className="text-sm text-gray-400 mt-1">NEO Tokens</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaUniversity className="text-green-500 text-2xl" />
            <span className="text-sm text-gray-400">DEPOSITED</span>
          </div>
          <div className="text-3xl font-bold">
            {depositData && Array.isArray(depositData) && depositData[0]
              ? formatEther(depositData[0] as bigint)
              : "0.00"}
          </div>
          <div className="text-sm text-gray-400 mt-1">Earning Interest</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaCoins className="text-purple-500 text-2xl" />
            <span className="text-sm text-gray-400">INTEREST RATE</span>
          </div>
          <div className="text-3xl font-bold">5.00%</div>
          <div className="text-sm text-gray-400 mt-1">
            Annual Percentage Yield
          </div>
        </div>
      </div>

      {/* Deposit & Withdraw */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deposit Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaArrowRight className="text-green-500 rotate-[-90deg]" />
            Deposit
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Amount (NEO)
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={tokenPending || !depositAmount}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {tokenPending ? "Approving..." : "Approve"}
              </button>
              <button
                onClick={handleDeposit}
                disabled={bankPending || !depositAmount}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {bankPending ? "Depositing..." : "Deposit"}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              You must approve tokens before depositing. Earn 5% APY on your
              deposits.
            </p>
          </div>
        </div>

        {/* Withdraw Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaArrowRight className="text-orange-500 rotate-[90deg]" />
            Withdraw
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Amount (NEO)
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleWithdraw}
              disabled={bankPending || !withdrawAmount}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {bankPending ? "Withdrawing..." : "Withdraw"}
            </button>
            <p className="text-xs text-gray-500">
              Withdraw your deposited funds plus accumulated interest.
            </p>
          </div>
        </div>
      </div>

      {/* Loan Request */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Request Loan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Loan Amount (NEO)
            </label>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Collateral Amount (NEO)
            </label>
            <input
              type="number"
              value={collateralAmount}
              onChange={(e) => setCollateralAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <button
          onClick={handleRequestLoan}
          disabled={bankPending || !loanAmount || !collateralAmount}
          className="mt-4 w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {bankPending ? "Requesting..." : "Request Loan"}
        </button>
        <p className="text-xs text-gray-500 mt-4">
          Minimum collateral ratio: 150%. Loan duration: 365 days. Interest
          rate: 5% APY.
        </p>
      </div>
    </div>
  );
}
