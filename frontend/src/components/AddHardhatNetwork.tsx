"use client";

import { useState } from "react";
import { FaPlus } from "react-icons/fa";

export function AddHardhatNetwork() {
  const [isAdding, setIsAdding] = useState(false);

  const addHardhatNetwork = async () => {
    setIsAdding(true);
    try {
      if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x7a69", // 31337 in hex
              chainName: "Hardhat Local",
              nativeCurrency: {
                name: "Ether",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["http://127.0.0.1:8545"],
              blockExplorerUrls: null,
            },
          ],
        });
        alert("Hardhat Local network added successfully!");
      } else {
        alert("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Error adding network:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={addHardhatNetwork}
      disabled={isAdding}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
    >
      <FaPlus />
      {isAdding ? "Adding Network..." : "Add Hardhat Network to Wallet"}
    </button>
  );
}
