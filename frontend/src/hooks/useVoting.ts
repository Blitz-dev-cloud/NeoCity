import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { contractAddresses } from "@/contracts/addresses";
import { VotingABI } from "@/contracts/abis";

export function useVoting() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Read functions
  const useProposalCount = () => {
    return useReadContract({
      address: contractAddresses.Voting,
      abi: VotingABI,
      functionName: "proposalCount",
    });
  };

  const useProposal = (proposalId?: bigint) => {
    return useReadContract({
      address: contractAddresses.Voting,
      abi: VotingABI,
      functionName: "proposals",
      args: proposalId !== undefined ? [proposalId] : undefined,
    });
  };

  const useHasVoted = (proposalId?: bigint, voter?: `0x${string}`) => {
    return useReadContract({
      address: contractAddresses.Voting,
      abi: VotingABI,
      functionName: "hasVoted",
      args: proposalId !== undefined && voter ? [proposalId, voter] : undefined,
    });
  };

  // Write functions
  const createProposal = (did: string, title: string, description: string) => {
    return writeContract({
      address: contractAddresses.Voting,
      abi: VotingABI,
      functionName: "createProposal",
      args: [did, title, description],
    });
  };

  const vote = (proposalId: bigint, support: boolean) => {
    return writeContract({
      address: contractAddresses.Voting,
      abi: VotingABI,
      functionName: "vote",
      args: [proposalId, support],
    });
  };

  const executeProposal = (proposalId: bigint) => {
    return writeContract({
      address: contractAddresses.Voting,
      abi: VotingABI,
      functionName: "executeProposal",
      args: [proposalId],
    });
  };

  return {
    useProposalCount,
    useProposal,
    useHasVoted,
    createProposal,
    vote,
    executeProposal,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
