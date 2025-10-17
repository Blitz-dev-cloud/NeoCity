import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { contractAddresses } from "@/contracts/addresses";
import { DeFiBankABI } from "@/contracts/abis";

export function useDeFiBank() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Read functions
  const useDeposit = (address?: `0x${string}`) => {
    return useReadContract({
      address: contractAddresses.DeFiBank,
      abi: DeFiBankABI,
      functionName: "getDeposit",
      args: address ? [address] : undefined,
    });
  };

  const useLoanCount = (address?: `0x${string}`) => {
    return useReadContract({
      address: contractAddresses.DeFiBank,
      abi: DeFiBankABI,
      functionName: "getLoanCount",
      args: address ? [address] : undefined,
    });
  };

  const useCalculateInterest = (address?: `0x${string}`) => {
    return useReadContract({
      address: contractAddresses.DeFiBank,
      abi: DeFiBankABI,
      functionName: "calculateInterest",
      args: address ? [address] : undefined,
    });
  };

  const useLoan = (borrower?: `0x${string}`, loanId?: bigint) => {
    return useReadContract({
      address: contractAddresses.DeFiBank,
      abi: DeFiBankABI,
      functionName: "loans",
      args: borrower && loanId !== undefined ? [borrower, loanId] : undefined,
    });
  };

  // Write functions
  const deposit = (amount: bigint) => {
    return writeContract({
      address: contractAddresses.DeFiBank,
      abi: DeFiBankABI,
      functionName: "deposit",
      args: [amount],
    });
  };

  const withdraw = (amount: bigint) => {
    return writeContract({
      address: contractAddresses.DeFiBank,
      abi: DeFiBankABI,
      functionName: "withdraw",
      args: [amount],
    });
  };

  const requestLoan = (amount: bigint, collateral: bigint) => {
    return writeContract({
      address: contractAddresses.DeFiBank,
      abi: DeFiBankABI,
      functionName: "requestLoan",
      args: [amount, collateral],
    });
  };

  const repayLoan = (loanId: bigint) => {
    return writeContract({
      address: contractAddresses.DeFiBank,
      abi: DeFiBankABI,
      functionName: "repayLoan",
      args: [loanId],
    });
  };

  return {
    useDeposit,
    useLoanCount,
    useCalculateInterest,
    useLoan,
    deposit,
    withdraw,
    requestLoan,
    repayLoan,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
