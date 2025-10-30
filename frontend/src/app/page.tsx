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
import { TrafficControlPanel } from "@/components/TrafficControlPanel";

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
  const [particles, setParticles] = useState<Array<{x: number, y: number, delay: number, duration: number}>>([]);
  const [blobs, setBlobs] = useState<Array<{x: number, y: number, delay: number}>>([]);

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

  // Generate random values on client side only
  useEffect(() => {
    setParticles(
      Array.from({ length: 40 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
        duration: Math.random() * 3 + 2,
      }))
    );
    setBlobs(
      Array.from({ length: 6 }, (_, i) => ({
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        delay: i * 0.5,
      }))
    );
  }, []);

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

  // Aurora Loading Animation
  if (isLoading) {
    return (
      <main className="relative h-screen w-screen overflow-hidden bg-black">
        {/* Aurora Background Layers */}
        <div className="absolute inset-0">
          {/* Layer 1 - Purple Aurora */}
          <motion.div
            className="absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.3), transparent)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Layer 2 - Blue Aurora */}
          <motion.div
            className="absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 30% 50%, rgba(59, 130, 246, 0.4), transparent)",
            }}
            animate={{
              x: [0, 100, 0],
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Layer 3 - Pink Aurora */}
          <motion.div
            className="absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(ellipse 60% 70% at 70% 60%, rgba(236, 72, 153, 0.3), transparent)",
            }}
            animate={{
              x: [0, -80, 0],
              y: [0, 50, 0],
              scale: [1, 1.25, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Layer 4 - Cyan Aurora */}
          <motion.div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 80% 40% at 50% 100%, rgba(6, 182, 212, 0.4), transparent)",
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Animated Fluid Blobs */}
        <div className="absolute inset-0">
          {blobs.map((blob, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full mix-blend-screen filter blur-3xl"
              style={{
                width: `${200 + i * 50}px`,
                height: `${200 + i * 50}px`,
                left: `${20 * i}%`,
                top: `${15 * i}%`,
                background: [
                  "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",
                  "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)",
                  "radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)",
                  "radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)",
                  "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)",
                  "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)",
                ][i],
              }}
              animate={{
                x: [0, blob.x, 0],
                y: [0, blob.y, 0],
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: blob.delay,
              }}
            />
          ))}
        </div>

        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
            backgroundSize: "200% 200%",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                boxShadow: "0 0 10px rgba(255,255,255,0.5)",
              }}
              animate={{
                y: [0, -100, 0],
                x: [0, particle.x * 0.3 - 15, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: "easeOut",
                delay: particle.delay,
              }}
            />
          ))}
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          {/* Glowing Orb */}
          <div className="relative w-80 h-80 mb-12">
            {/* Outer Glow Rings */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${
                    [
                      "rgba(59,130,246,0.3)",
                      "rgba(139,92,246,0.3)",
                      "rgba(236,72,153,0.3)",
                      "rgba(6,182,212,0.3)",
                    ][i]
                  }, transparent)`,
                  filter: "blur(20px)",
                }}
                animate={{
                  scale: [1, 1.5 + i * 0.2, 1],
                  opacity: [0.5, 0.2, 0.5],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
              />
            ))}

            {/* Central Orb */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="relative">
                <motion.div
                  className="text-9xl"
                  animate={{
                    rotate: [0, 360],
                    filter: [
                      "drop-shadow(0 0 20px rgba(59,130,246,0.8))",
                      "drop-shadow(0 0 40px rgba(236,72,153,0.8))",
                      "drop-shadow(0 0 20px rgba(59,130,246,0.8))",
                    ],
                  }}
                  transition={{
                    rotate: {
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    },
                    filter: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                >
                  🏙️
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Title with Gradient Animation */}
          <motion.div
            className="relative mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.h1
              className="text-7xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
              style={{
                backgroundSize: "200% 200%",
              }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              NeoCity 3D
            </motion.h1>

            <motion.div
              className="h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full"
              animate={{
                scaleX: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Entering the Future of Smart Cities
          </motion.p>

          {/* Fluid Progress Bar */}
          <div className="relative w-96 h-3 bg-black/30 backdrop-blur-sm rounded-full overflow-hidden border border-white/10 mb-12">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 3, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>

          {/* Feature Cards */}
          <motion.div
            className="grid grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {[
              {
                icon: "🏦",
                label: "DeFi Banking",
                color: "from-blue-500/20 to-cyan-500/20",
                border: "border-blue-400/30",
              },
              {
                icon: "🗳️",
                label: "Governance",
                color: "from-purple-500/20 to-pink-500/20",
                border: "border-purple-400/30",
              },
              {
                icon: "🏥",
                label: "Healthcare",
                color: "from-red-500/20 to-orange-500/20",
                border: "border-red-400/30",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className={`relative bg-gradient-to-br ${item.color} backdrop-blur-xl px-8 py-6 rounded-2xl border ${item.border} overflow-hidden`}
                animate={{
                  y: [0, -10, 0],
                  boxShadow: [
                    "0 0 20px rgba(59,130,246,0.2)",
                    "0 0 40px rgba(139,92,246,0.4)",
                    "0 0 20px rgba(59,130,246,0.2)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "linear",
                  }}
                />
                <div className="relative text-center">
                  <div className="text-5xl mb-3">{item.icon}</div>
                  <div className="text-sm font-semibold text-white/80">
                    {item.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Info */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 bg-green-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              />
              Powered by Web3
            </span>
            <span>•</span>
            <span>Three.js + React Three Fiber</span>
            <span>•</span>
            <span>Blockchain Technology</span>
          </div>
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

      {/* Traffic Control Panel */}
      <TrafficControlPanel />

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
