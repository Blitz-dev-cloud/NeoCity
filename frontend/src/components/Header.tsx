"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { useState } from "react";
import { FaBell } from "react-icons/fa";

export function Header() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [showNotifications, setShowNotifications] = useState(false);

  // Get network name and color based on chainId
  const getNetworkInfo = () => {
    switch (chainId) {
      case 31337:
        return { name: "Hardhat Local", color: "green" };
      case 11155111:
        return { name: "Sepolia Testnet", color: "blue" };
      default:
        return { name: "Unknown Network", color: "red" };
    }
  };

  const networkInfo = getNetworkInfo();

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-500">NeoCity</h1>
            <span className="ml-2 text-sm text-gray-400">
              Smart City Platform
            </span>
          </div>

          {/* Right side - Notifications & Wallet */}
          <div className="flex items-center gap-4">
            {/* Network Status */}
            {isConnected && (
              <div
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                  networkInfo.color === "green"
                    ? "bg-green-500/10 border border-green-500/20"
                    : networkInfo.color === "blue"
                    ? "bg-blue-500/10 border border-blue-500/20"
                    : "bg-red-500/10 border border-red-500/20"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    networkInfo.color === "green"
                      ? "bg-green-500"
                      : networkInfo.color === "blue"
                      ? "bg-blue-500"
                      : "bg-red-500"
                  }`}
                />
                <span
                  className={`text-sm ${
                    networkInfo.color === "green"
                      ? "text-green-400"
                      : networkInfo.color === "blue"
                      ? "text-blue-400"
                      : "text-red-400"
                  }`}
                >
                  {networkInfo.name}
                </span>
              </div>
            )}

            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
            >
              <FaBell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Wallet Connect Button */}
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
