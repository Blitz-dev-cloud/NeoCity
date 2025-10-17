"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useVoting } from "@/hooks/useVoting";
import { FaVoteYea, FaWallet, FaCheck, FaTimes } from "react-icons/fa";

export default function VotingPage() {
  const { address, isConnected } = useAccount();
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("7");
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);

  const { useProposalCount, createProposal, vote, isPending } = useVoting();

  const { data: proposalCount } = useProposalCount();

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <FaWallet className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">
            Please connect your wallet to participate in voting
          </p>
        </div>
      </div>
    );
  }

  const handleCreateProposal = async () => {
    if (!description || !duration) return;
    try {
      const durationInSeconds = BigInt(parseInt(duration) * 24 * 60 * 60);
      await createProposal(description, durationInSeconds);
      setDescription("");
      setDuration("7");
    } catch (error) {
      console.error("Failed to create proposal:", error);
    }
  };

  const handleVote = async (proposalId: number, support: boolean) => {
    try {
      await vote(BigInt(proposalId), support);
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Voting</h1>
        <p className="text-gray-400">Participate in community governance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-2">Total Proposals</div>
          <div className="text-3xl font-bold">
            {proposalCount?.toString() || "0"}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-2">Active Proposals</div>
          <div className="text-3xl font-bold text-green-500">0</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-2">Your Votes</div>
          <div className="text-3xl font-bold text-blue-500">0</div>
        </div>
      </div>

      {/* Create Proposal */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaVoteYea className="text-purple-500" />
          Create New Proposal
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your proposal..."
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Duration (days)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              max="365"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            onClick={handleCreateProposal}
            disabled={isPending || !description || !duration}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isPending ? "Creating..." : "Create Proposal"}
          </button>
        </div>
      </div>

      {/* Active Proposals */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Active Proposals</h2>
        <div className="space-y-4">
          {proposalCount && Number(proposalCount) > 0 ? (
            <div className="text-gray-400 text-center py-8">
              Loading proposals...
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">
              No active proposals. Be the first to create one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
