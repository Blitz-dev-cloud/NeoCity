"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useDeFiToken } from "@/hooks/useDeFiToken";
import {
  FaLock,
  FaCoins,
  FaExclamationTriangle,
  FaCheckCircle,
  FaHistory,
  FaChartLine,
  FaShieldAlt,
  FaUserShield,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function TokenVaultPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  // Contract owner address (deployer)
  const CONTRACT_OWNER = "0xd48207CE2b338660340f675B3c7dF209eE38ef0d";
  const isOwner = address?.toLowerCase() === CONTRACT_OWNER.toLowerCase();

  // State
  const [mintAddress, setMintAddress] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Hooks
  const { useBalance, mint, isPending: tokenPending } = useDeFiToken();
  const { data: balance } = useBalance(address);

  // Calculate total supply
  const totalSupply =
    balance && typeof balance === "bigint"
      ? parseFloat(formatEther(balance))
      : 0;

  // Notification helper
  const showNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle Mint (owner only)
  const handleMint = async () => {
    if (!mintAddress || !mintAmount || !isConnected) {
      showNotification("Please enter address and amount", "error");
      return;
    }

    if (!isOwner) {
      showNotification("Only the contract owner can mint tokens", "error");
      return;
    }

    try {
      // Use smaller gas limit to reduce fees
      await mint(mintAddress as `0x${string}`, parseEther(mintAmount));
      showNotification(
        `Successfully minted ${mintAmount} NEO to ${mintAddress}`,
        "success"
      );
      setMintAddress("");
      setMintAmount("");
    } catch (error: unknown) {
      console.error("Mint failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("Ownable")) {
        showNotification("Only the contract owner can mint tokens", "error");
      } else if (errorMessage.includes("user rejected")) {
        showNotification("Transaction cancelled by user", "info");
      } else {
        showNotification("Mint failed. Please try again.", "error");
      }
    }
  };

  // Redirect non-owners
  if (isConnected && !isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 backdrop-blur-xl text-center"
          >
            <FaShieldAlt className="text-red-400 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-400 mb-2">
              This page is restricted to the contract owner only.
            </p>
            <p className="text-blue-300 mb-6">
              Looking for free tokens? Visit the Token Faucet instead!
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push("/faucet")}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all flex items-center gap-2"
              >
                <FaCoins />
                Go to Token Faucet
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="p-4 bg-yellow-500/20 rounded-xl">
              <FaLock className="text-yellow-400 text-3xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Token Vault</h1>
              <p className="text-gray-400">Secure Token Minting & Management</p>
            </div>
          </div>

          {/* Owner Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <FaUserShield className="text-yellow-400" />
            <span className="text-yellow-300 font-semibold">
              Contract Owner Access
            </span>
          </div>
        </motion.div>

        {/* Notification */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-6 p-4 rounded-xl border ${
              notification.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-300"
                : notification.type === "error"
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : "bg-blue-500/10 border-blue-500/30 text-blue-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <FaCheckCircle />
              ) : (
                <FaExclamationTriangle />
              )}
              <span>{notification.message}</span>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Minting Panel */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-2xl p-8 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <FaCoins className="text-yellow-400 text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Mint NEO Tokens
                  </h2>
                  <p className="text-sm text-gray-400">
                    Create new tokens up to max supply
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <FaExclamationTriangle className="text-yellow-400" />
                  <span className="text-yellow-300 font-semibold">
                    Important
                  </span>
                </div>
                <ul className="text-sm text-gray-300 space-y-1 ml-6 list-disc">
                  <li>Only contract owner can mint tokens</li>
                  <li>Max supply: 1,000,000,000 NEO</li>
                  <li>Transactions are irreversible</li>
                  <li>Verify recipient address carefully</li>
                </ul>
              </div>

              {/* Mint Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2 font-medium">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={mintAddress}
                    onChange={(e) => setMintAddress(e.target.value)}
                    placeholder="0x..."
                    disabled={!isOwner}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the Ethereum address to receive tokens
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2 font-medium">
                    Amount (NEO)
                  </label>
                  <input
                    type="number"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    placeholder="1000"
                    disabled={!isOwner}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of tokens to mint
                  </p>
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setMintAmount("1000")}
                    disabled={!isOwner}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-all disabled:opacity-50"
                  >
                    1,000
                  </button>
                  <button
                    onClick={() => setMintAmount("10000")}
                    disabled={!isOwner}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-all disabled:opacity-50"
                  >
                    10,000
                  </button>
                  <button
                    onClick={() => setMintAmount("100000")}
                    disabled={!isOwner}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-all disabled:opacity-50"
                  >
                    100,000
                  </button>
                  <button
                    onClick={() => setMintAmount("1000000")}
                    disabled={!isOwner}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-all disabled:opacity-50"
                  >
                    1M
                  </button>
                </div>

                <button
                  onClick={handleMint}
                  disabled={
                    tokenPending || !mintAddress || !mintAmount || !isOwner
                  }
                  className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {tokenPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <FaCoins />
                      Mint Tokens
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Stats Panel */}
          <div className="space-y-6">
            {/* Supply Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <FaChartLine className="text-blue-400" />
                <h3 className="text-lg font-bold text-white">Supply Stats</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Your Balance</p>
                  <p className="text-2xl font-bold text-white">
                    {balance ? formatEther(balance) : "0"} NEO
                  </p>
                </div>

                <div className="h-px bg-gray-700" />

                <div>
                  <p className="text-xs text-gray-400 mb-1">Max Supply</p>
                  <p className="text-lg font-bold text-white">
                    1,000,000,000 NEO
                  </p>
                </div>

                <div className="h-px bg-gray-700" />

                <div>
                  <p className="text-xs text-gray-400 mb-1">
                    Available to Mint
                  </p>
                  <p className="text-lg font-bold text-green-400">
                    {(1000000000 - totalSupply).toLocaleString()} NEO
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Security Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <FaShieldAlt className="text-green-400" />
                <h3 className="text-lg font-bold text-white">
                  Security Features
                </h3>
              </div>

              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Owner-only minting</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Max supply cap enforced</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>On-chain verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Transparent transactions</span>
                </li>
              </ul>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <FaHistory className="text-purple-400" />
                <h3 className="text-lg font-bold text-white">Quick Actions</h3>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => router.push("/banking")}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all"
                >
                  View Banking
                </button>
                <button
                  onClick={() => router.push("/faucet")}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-all"
                >
                  Token Faucet
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-all"
                >
                  Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
