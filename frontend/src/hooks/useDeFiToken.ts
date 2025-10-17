import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { contractAddresses } from "@/contracts/addresses";
import { DeFiTokenABI } from "@/contracts/abis";

export function useDeFiToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Read functions
  const useBalance = (address?: `0x${string}`) => {
    return useReadContract({
      address: contractAddresses.DeFiToken,
      abi: DeFiTokenABI,
      functionName: "balanceOf",
      args: address ? [address] : undefined,
    });
  };

  const useTotalSupply = () => {
    return useReadContract({
      address: contractAddresses.DeFiToken,
      abi: DeFiTokenABI,
      functionName: "totalSupply",
    });
  };

  const useAllowance = (owner?: `0x${string}`, spender?: `0x${string}`) => {
    return useReadContract({
      address: contractAddresses.DeFiToken,
      abi: DeFiTokenABI,
      functionName: "allowance",
      args: owner && spender ? [owner, spender] : undefined,
    });
  };

  // Write functions
  const transfer = (to: `0x${string}`, amount: bigint) => {
    return writeContract({
      address: contractAddresses.DeFiToken,
      abi: DeFiTokenABI,
      functionName: "transfer",
      args: [to, amount],
    });
  };

  const approve = (spender: `0x${string}`, amount: bigint) => {
    return writeContract({
      address: contractAddresses.DeFiToken,
      abi: DeFiTokenABI,
      functionName: "approve",
      args: [spender, amount],
    });
  };

  const mint = (to: `0x${string}`, amount: bigint) => {
    return writeContract({
      address: contractAddresses.DeFiToken,
      abi: DeFiTokenABI,
      functionName: "mint",
      args: [to, amount],
    });
  };

  return {
    useBalance,
    useTotalSupply,
    useAllowance,
    transfer,
    approve,
    mint,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
