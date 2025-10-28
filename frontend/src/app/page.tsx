"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import dynamic from "next/dynamic";
import { useDeFiToken } from "@/hooks/useDeFiToken";
import { useDeFiBank } from "@/hooks/useDeFiBank";
import { useIdentityRegistry } from "@/hooks/useIdentityRegistry";
import { useVoting } from "@/hooks/useVoting";
import { formatEther } from "viem";
import { FaSpinner } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { BankPanel } from "@/components/modules/BankPanel";

// Dynamic import for 3D scene (client-side only)
const CityScene3D = dynamic(
  () =>
    import("@/components/CityScene3D").then((mod) => ({
      default: mod.CityScene3D,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-slate-900 to-blue-900">
        <FaSpinner className="text-6xl text-blue-400 animate-spin" />
      </div>
    ),
  }
);

type BuildingType =
  | "bank"
  | "voting"
  | "identity"
  | "grievance"
  | "healthcare"
  | "supply"
  | "traffic"
  | "token";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [activeModal, setActiveModal] = useState<BuildingType | null>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hooks (only used when connected)
  const { useBalance } = useDeFiToken();
  const { useDeposit } = useDeFiBank();
  const { useIsVerified } = useIdentityRegistry();
  const { useProposalCount } = useVoting();

  // Data (only fetch when connected)
  const { data: balance } = useBalance(address);
  const { data: bankDeposit } = useDeposit(address);
  const { data: isVerified } = useIsVerified(address);
  const { data: proposalCount } = useProposalCount();

  // Loading animation timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 second loading animation

    return () => clearTimeout(timer);
  }, []);

  const handleBuildingClick = (buildingId: string) => {
    // Allow viewing all buildings, wallet optional for transactions
    setActiveModal(buildingId as BuildingType);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  // Crazy Loading Animation
  if (isLoading) {
    return (
      <main className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: Math.random() * 2 + 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Central Loading Animation */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          {/* Spinning Rings */}
          <div className="relative w-64 h-64 mb-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 border-4 border-transparent rounded-full"
                style={{
                  borderTopColor: ["#3B82F6", "#8B5CF6", "#EC4899"][i],
                  borderRightColor: ["#3B82F6", "#8B5CF6", "#EC4899"][i],
                }}
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: {
                    duration: 2 - i * 0.3,
                    repeat: Infinity,
                    ease: "linear",
                  },
                  scale: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
              />
            ))}

            {/* Center Icon */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="text-8xl">🏙️</div>
            </motion.div>
          </div>

          {/* Animated Text */}
          <motion.h1
            className="text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            NeoCity 3D
          </motion.h1>

          <motion.p
            className="text-xl text-blue-300 mb-8"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Loading your immersive experience...
          </motion.p>

          {/* Progress Bar */}
          <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "easeOut" }}
            />
          </div>

          {/* Loading Stats */}
          <motion.div
            className="mt-12 grid grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {[
              { icon: "🏦", label: "Banking" },
              { icon: "🗳️", label: "Governance" },
              { icon: "�", label: "Healthcare" },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="text-center"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                <div className="text-4xl mb-2">{item.icon}</div>
                <div className="text-sm text-gray-400">{item.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Text */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
          animate={{
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <p className="text-sm text-gray-500">
            Built with Three.js • React Three Fiber • Web3
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      {/* 3D City Scene */}
      <div className="absolute inset-0">
        <CityScene3D
          onBuildingClick={handleBuildingClick}
          hoveredBuilding={hoveredBuilding}
          onBuildingHover={setHoveredBuilding}
        />
      </div>

      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-40 pointer-events-none">
        {/* Left side - Stats */}
        {isConnected && (
          <div className="flex flex-col gap-3 pointer-events-auto">
            <div className="bg-black/60 backdrop-blur-xl px-4 py-3 rounded-xl border border-blue-400/30 shadow-lg shadow-blue-500/20">
              <div className="text-xs text-blue-300 mb-1">Wallet Balance</div>
              <div className="text-lg font-bold text-white">
                💰{" "}
                {balance ? `${formatEther(balance).slice(0, 8)} NEO` : "0 NEO"}
              </div>
            </div>
            <div className="bg-black/60 backdrop-blur-xl px-4 py-3 rounded-xl border border-green-400/30 shadow-lg shadow-green-500/20">
              <div className="text-xs text-green-300 mb-1">Identity Status</div>
              <div
                className={`text-lg font-bold ${
                  isVerified ? "text-green-400" : "text-orange-400"
                }`}
              >
                {isVerified ? "✓ Verified" : "⚠ Unverified"}
              </div>
            </div>
            <div className="bg-black/60 backdrop-blur-xl px-4 py-3 rounded-xl border border-purple-400/30 shadow-lg shadow-purple-500/20">
              <div className="text-xs text-purple-300 mb-1">
                Active Proposals
              </div>
              <div className="text-lg font-bold text-white">
                🗳️ {proposalCount?.toString() || "0"}
              </div>
            </div>
          </div>
        )}

        {/* Right side - Wallet Connection */}
        <div className="ml-auto bg-black/60 backdrop-blur-xl rounded-xl border border-blue-400/30 shadow-lg shadow-blue-500/20 pointer-events-auto">
          <ConnectButton />
        </div>
      </div>

      {/* Bottom - Instructions */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 shadow-2xl">
          <p className="text-white text-sm font-semibold text-center">
            🖱️ Click on buildings to interact • 🌐 Drag to rotate • 🔍 Scroll to
            zoom
          </p>
        </div>
      </div>

      {/* Floating Panels */}
      <AnimatePresence>
        {activeModal === "bank" && (
          <BankPanel
            onClose={handleCloseModal}
            balance={balance}
            bankDeposit={bankDeposit}
          />
        )}

        {activeModal && activeModal !== "bank" && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-xl p-8 rounded-2xl border-2 border-purple-400/50 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">
                Coming Soon
              </h2>
              <p className="text-purple-200 mb-6">
                This module is under development
              </p>
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
