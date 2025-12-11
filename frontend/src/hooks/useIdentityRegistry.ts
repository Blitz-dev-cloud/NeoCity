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

  // Read functions - using actual contract functions
  // Note: Contract uses DID-based system, so we'll check if user has any DIDs
  const useUserDIDs = (address?: `0x${string}`) => {
    return useReadContract({
      address: contractAddresses.IdentityRegistry,
      abi: IdentityRegistryABI,
      functionName: "userDIDs",
      args:
        address && address !== "0x0000000000000000000000000000000000000000"
          ? [address, 0]
          : undefined,
      query: {
        enabled:
          !!address && address !== "0x0000000000000000000000000000000000000000",
      },
    });
  };

  const useIdentityByDID = (did?: string) => {
    return useReadContract({
      address: contractAddresses.IdentityRegistry,
      abi: IdentityRegistryABI,
      functionName: "identities",
      args: did ? [did] : undefined,
      query: {
        enabled: !!did && did.length > 0,
      },
    });
  };

  const useVerifyIdentity = (did?: string) => {
    return useReadContract({
      address: contractAddresses.IdentityRegistry,
      abi: IdentityRegistryABI,
      functionName: "verifyIdentity",
      args: did ? [did] : undefined,
      query: {
        enabled: !!did && did.length > 0,
      },
    });
  };

  // Write functions - using actual contract signature
  const registerIdentity = (
    name: string,
    dateOfBirth: string,
    idNumber: string,
    userAddress: `0x${string}`
  ) => {
    // Generate DID based on user address
    const did = `did:neocity:${userAddress.toLowerCase()}`;

    // Create DID document JSON
    const didDocument = JSON.stringify({
      "@context": "https://www.w3.org/ns/did/v1",
      id: did,
      name: name,
      dateOfBirth: dateOfBirth,
      idNumber: idNumber,
      created: new Date().toISOString(),
    });

    return writeContract({
      address: contractAddresses.IdentityRegistry,
      abi: IdentityRegistryABI,
      functionName: "registerIdentity",
      args: [did, didDocument],
    });
  };

  const updateIdentity = (
    did: string,
    name: string,
    dateOfBirth: string,
    idNumber: string
  ) => {
    const didDocument = JSON.stringify({
      "@context": "https://www.w3.org/ns/did/v1",
      id: did,
      name: name,
      dateOfBirth: dateOfBirth,
      idNumber: idNumber,
      updated: new Date().toISOString(),
    });

    return writeContract({
      address: contractAddresses.IdentityRegistry,
      abi: IdentityRegistryABI,
      functionName: "updateIdentity",
      args: [did, didDocument],
    });
  };

  const revokeIdentity = (did: string) => {
    return writeContract({
      address: contractAddresses.IdentityRegistry,
      abi: IdentityRegistryABI,
      functionName: "revokeIdentity",
      args: [did],
    });
  };

  return {
    useUserDIDs,
    useIdentityByDID,
    useVerifyIdentity,
    registerIdentity,
    updateIdentity,
    revokeIdentity,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
