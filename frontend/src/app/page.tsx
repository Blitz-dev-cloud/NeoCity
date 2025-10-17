"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import dynamic from "next/dynamic";
import { useDeFiToken } from "@/hooks/useDeFiToken";
import { useDeFiBank } from "@/hooks/useDeFiBank";
import { useIdentityRegistry } from "@/hooks/useIdentityRegistry";
import { useVoting } from "@/hooks/useVoting";
import { formatEther } from "viem";
import { FaWallet, FaSpinner } from "react-icons/fa";
import { AnimatePresence } from "framer-motion";
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

  // Hooks
  const { useBalance } = useDeFiToken();
  const { useDeposit, deposit, withdraw } = useDeFiBank();
  const { useIsVerified } = useIdentityRegistry();
  const { useProposalCount } = useVoting();

  // Data
  const { data: balance } = useBalance(address);
  const { data: bankDeposit } = useDeposit(address);
  const { data: isVerified } = useIsVerified(address);
  const { data: proposalCount } = useProposalCount();

  const handleBuildingClick = (buildingId: string) => {
    setActiveModal(buildingId as BuildingType);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  // Wallet not connected view
  if (!isConnected) {
    return (
      <main className="relative h-screen w-screen overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-purple-900">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 animate-pulse" />

        {/* Stars */}
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7 + 0.3,
                animation: `pulse ${
                  Math.random() * 3 + 2
                }s ease-in-out infinite`,
              }}
            />
          ))}
        </div>

        {/* Connect Wallet Prompt */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <div className="text-center bg-white/5 backdrop-blur-2xl p-12 rounded-3xl border-2 border-blue-400/50 shadow-2xl shadow-blue-500/50">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-8 shadow-2xl shadow-blue-500/50 animate-pulse">
              <FaWallet className="w-16 h-16 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-7xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              🏙️ NeoCity 3D
            </h1>
            <p className="text-2xl text-gray-300 mb-12 font-semibold">
              Your Immersive 3D Smart City
            </p>
            <div className="flex justify-center mb-8">
              <ConnectButton />
            </div>
            <div className="mt-8 text-sm text-gray-400 space-y-2">
              <p>🏦 DeFi Banking • 🗳️ Governance • 🆔 Identity</p>
              <p>🏥 Healthcare • 🚚 Supply Chain • 🚦 Traffic Control</p>
              <p className="text-xs mt-4 text-gray-500">
                Built with Three.js + React Three Fiber
              </p>
            </div>
          </div>
        </div>
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
        <div className="flex flex-col gap-3 pointer-events-auto">
          <div className="bg-black/60 backdrop-blur-xl px-4 py-3 rounded-xl border border-blue-400/30 shadow-lg shadow-blue-500/20">
            <div className="text-xs text-blue-300 mb-1">Wallet Balance</div>
            <div className="text-lg font-bold text-white">
              💰 {balance ? `${formatEther(balance).slice(0, 8)} NEO` : "0 NEO"}
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
            <div className="text-xs text-purple-300 mb-1">Active Proposals</div>
            <div className="text-lg font-bold text-white">
              🗳️ {proposalCount?.toString() || "0"}
            </div>
          </div>
        </div>

        {/* Right side - Wallet Connection */}
        <div className="bg-black/60 backdrop-blur-xl rounded-xl border border-blue-400/30 shadow-lg shadow-blue-500/20 pointer-events-auto">
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
