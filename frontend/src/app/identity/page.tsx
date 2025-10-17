"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useIdentityRegistry } from "@/hooks/useIdentityRegistry";
import {
  FaIdCard,
  FaWallet,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function IdentityPage() {
  const { address, isConnected } = useAccount();
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [idNumber, setIdNumber] = useState("");

  const { useIsVerified, useGetIdentity, registerIdentity, isPending } =
    useIdentityRegistry();

  const { data: isVerified } = useIsVerified(address);
  const { data: identity } = useGetIdentity(address);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <FaWallet className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">
            Please connect your wallet to manage your identity
          </p>
        </div>
      </div>
    );
  }

  const handleRegister = async () => {
    if (!name || !dateOfBirth || !idNumber) return;
    try {
      await registerIdentity(name, dateOfBirth, idNumber);
      setName("");
      setDateOfBirth("");
      setIdNumber("");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Identity Registry</h1>
        <p className="text-gray-400">
          Manage your digital identity on the blockchain
        </p>
      </div>

      {/* Identity Status */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Identity Status</h2>
            <p className="text-gray-400">
              Your address: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
          <div className="text-right">
            {isVerified ? (
              <div className="flex items-center gap-2 text-green-500">
                <FaCheck className="text-2xl" />
                <span className="text-xl font-bold">Verified</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-500">
                <FaExclamationTriangle className="text-2xl" />
                <span className="text-xl font-bold">Not Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Identity Information */}
      {identity && Array.isArray(identity) && identity[0] ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Your Identity</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Name</span>
              <span className="font-semibold">{identity[0]}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">Date of Birth</span>
              <span className="font-semibold">{identity[1]}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-800">
              <span className="text-gray-400">ID Number</span>
              <span className="font-semibold">{identity[2]}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Verified</span>
              <span
                className={`font-semibold ${
                  identity[3] ? "text-green-500" : "text-yellow-500"
                }`}
              >
                {identity[3] ? "Yes" : "Pending"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaIdCard className="text-orange-500" />
            Register Your Identity
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                ID Number
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="ABC123456"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <button
              onClick={handleRegister}
              disabled={isPending || !name || !dateOfBirth || !idNumber}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {isPending ? "Registering..." : "Register Identity"}
            </button>
            <p className="text-xs text-gray-500">
              Your identity will be submitted for verification by city
              administrators.
            </p>
          </div>
        </div>
      )}

      {/* Information */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h3 className="font-semibold text-blue-400 mb-2">
          Why Verify Your Identity?
        </h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Access all platform features</li>
          <li>• Participate in city governance</li>
          <li>• Apply for loans and financial services</li>
          <li>• Use healthcare and other civic services</li>
        </ul>
      </div>
    </div>
  );
}
