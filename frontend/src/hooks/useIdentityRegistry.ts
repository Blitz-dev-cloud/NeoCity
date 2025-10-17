import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { contractAddresses } from "@/contracts/addresses";
import { IdentityRegistryABI } from "@/contracts/abis";

export function useIdentityRegistry() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Read functions
  const useIsVerified = (address?: `0x${string}`) => {
    return useReadContract({
      address: contractAddresses.IdentityRegistry,
      abi: IdentityRegistryABI,
      functionName: "isVerified",
      args: address ? [address] : undefined,
    });
  };

  const useGetIdentity = (address?: `0x${string}`) => {
    return useReadContract({
      address: contractAddresses.IdentityRegistry,
      abi: IdentityRegistryABI,
      functionName: "getIdentity",
      args: address ? [address] : undefined,
    });
  };

  // Write functions
  const registerIdentity = (
    name: string,
    dateOfBirth: string,
    idNumber: string
  ) => {
    return writeContract({
      address: contractAddresses.IdentityRegistry,
      abi: IdentityRegistryABI,
      functionName: "registerIdentity",
      args: [name, dateOfBirth, idNumber],
    });
  };

  const verifyIdentity = (userAddress: `0x${string}`) => {
    return writeContract({
      address: contractAddresses.IdentityRegistry,
      abi: IdentityRegistryABI,
      functionName: "verifyIdentity",
      args: [userAddress],
    });
  };

  const revokeIdentity = (userAddress: `0x${string}`) => {
    return writeContract({
      address: contractAddresses.IdentityRegistry,
      abi: IdentityRegistryABI,
      functionName: "revokeIdentity",
      args: [userAddress],
    });
  };

  return {
    useIsVerified,
    useGetIdentity,
    registerIdentity,
    verifyIdentity,
    revokeIdentity,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
