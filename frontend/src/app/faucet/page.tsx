"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFaucet,
  FaCoins,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaWallet,
  FaArrowLeft,
  FaInfoCircle,
} from "react-icons/fa";
import { useDeFiToken } from "@/hooks/useDeFiToken";
import { contractAddresses } from "@/contracts/addresses";
import { formatEther, parseEther } from "viem";

const FAUCET_AMOUNT = "1000"; // 1000 NEO tokens
const COOLDOWN_HOURS = 24;
const CONTRACT_OWNER = "0xd48207CE2b338660340f675B3c7dF209eE38ef0d";

export default function FaucetPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { useBalance, mint, isPending, isSuccess } = useDeFiToken();

  const { data: balance } = useBalance(address);
  const isOwner = address?.toLowerCase() === CONTRACT_OWNER.toLowerCase();
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [lastClaim, setLastClaim] = useState<number | null>(null);
  const [canClaim, setCanClaim] = useState(true);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState("");

  // Check last claim time from localStorage
  useEffect(() => {
    if (address) {
      const stored = localStorage.getItem(`faucet_${address}`);
      if (stored) {
        const lastClaimTime = parseInt(stored);
        setLastClaim(lastClaimTime);

        const now = Date.now();
        const timeSince = now - lastClaimTime;
        const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;

        if (timeSince < cooldownMs) {
          setCanClaim(false);
        } else {
          setCanClaim(true);
        }
      }
    }
  }, [address]);

  // Update countdown timer
  useEffect(() => {
    if (!canClaim && lastClaim) {
      const interval = setInterval(() => {
        const now = Date.now();
        const timeSince = now - lastClaim;
        const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;
        const timeLeft = cooldownMs - timeSince;

        if (timeLeft <= 0) {
          setCanClaim(true);
          setTimeUntilNextClaim("");
        } else {
          const hours = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutes = Math.floor(
            (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          setTimeUntilNextClaim(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [canClaim, lastClaim]);

  // Reset on success
  useEffect(() => {
    if (isSuccess) {
      const now = Date.now();
      setLastClaim(now);
      setCanClaim(false);
      if (address) {
        localStorage.setItem(`faucet_${address}`, now.toString());
      }
      showNotification(
        `Successfully claimed ${FAUCET_AMOUNT} NEO tokens!`,
        "success"
      );
    }
  }, [isSuccess, address]);

  const showNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleClaim = async () => {
    if (!address || !canClaim) return;

    try {
      await mint(address, parseEther(FAUCET_AMOUNT));
    } catch (error: unknown) {
      console.error("Claim failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("Ownable")) {
        showNotification(
          "Faucet is currently unavailable. Only the contract owner can mint tokens.",
          "error"
        );
      } else {
        showNotification("Failed to claim tokens. Please try again.", "error");
      }
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-purple-950 to-blue-900 flex items-center justify-center p-4">
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
            Please connect your wallet to claim free NEO tokens
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-purple-950 to-blue-900 p-8">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/30 to-purple-600/30 hover:from-blue-600/40 hover:to-purple-600/40 backdrop-blur-xl rounded-xl border border-blue-500/30 hover:border-blue-500/50 text-white transition-all group"
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
                : notification.type === "error"
                ? "bg-red-500/90 border border-red-400"
                : "bg-blue-500/90 border border-blue-400"
            }`}
          >
            <p className="text-white font-semibold">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-lg mb-4">
            <FaFaucet className="text-6xl text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            NEO Token Faucet
          </h1>
          <p className="text-xl text-blue-200">
            Get free NEO tokens for testing and exploring NeoCity
          </p>
        </motion.div>

        {/* Owner Banner */}
        {isOwner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/50 rounded-2xl p-4 mb-6 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaInfoCircle className="text-yellow-400 text-xl" />
                <div>
                  <p className="text-yellow-300 font-semibold">
                    Contract Owner Detected
                  </p>
                  <p className="text-sm text-gray-300">
                    Need to mint larger amounts? Visit the Token Vault for
                    unlimited minting.
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push("/vault")}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-all"
              >
                Go to Vault →
              </button>
            </div>
          </motion.div>
        )}

        {/* Main Faucet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-blue-500/30 mb-6"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl px-6 py-4 mb-6">
              <FaCoins className="text-4xl text-yellow-400" />
              <div className="text-left">
                <p className="text-sm text-gray-400">Claim Amount</p>
                <p className="text-3xl font-bold text-white">
                  {FAUCET_AMOUNT} NEO
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">Your Balance</p>
                <p className="text-2xl font-bold text-white">
                  {balance ? formatEther(balance) : "0"} NEO
                </p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">Cooldown Period</p>
                <p className="text-2xl font-bold text-white">
                  {COOLDOWN_HOURS} Hours
                </p>
              </div>
            </div>

            {!canClaim && timeUntilNextClaim && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6"
              >
                <div className="flex items-center justify-center gap-3">
                  <FaClock className="text-2xl text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">
                      Next claim available in
                    </p>
                    <p className="text-xl font-bold text-yellow-400">
                      {timeUntilNextClaim}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <button
              onClick={handleClaim}
              disabled={!canClaim || isPending}
              className={`w-full py-4 px-8 rounded-xl font-bold text-lg transition-all shadow-lg ${
                canClaim && !isPending
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white cursor-pointer"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Claiming...
                </span>
              ) : canClaim ? (
                <span className="flex items-center justify-center gap-2">
                  <FaFaucet />
                  Claim {FAUCET_AMOUNT} NEO
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FaClock />
                  Cooldown Active
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30"
          >
            <FaInfoCircle className="text-3xl text-blue-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">How It Works</h3>
            <p className="text-sm text-gray-400">
              Click the claim button to receive {FAUCET_AMOUNT} NEO tokens
              instantly. You can claim once every {COOLDOWN_HOURS} hours.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30"
          >
            <FaCheckCircle className="text-3xl text-green-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Free Testing</h3>
            <p className="text-sm text-gray-400">
              These tokens are for testing NeoCity services like banking,
              voting, and more. Use them freely!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30"
          >
            <FaExclamationTriangle className="text-3xl text-yellow-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Fair Usage</h3>
            <p className="text-sm text-gray-400">
              Please use the faucet responsibly. Cooldown prevents abuse and
              ensures fair distribution.
            </p>
          </motion.div>
        </div>

        {/* Contract Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-gray-500">
            NEO Token Contract: {contractAddresses.DeFiToken}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
