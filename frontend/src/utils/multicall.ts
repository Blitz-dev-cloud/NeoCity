import { readContracts } from "@wagmi/core";
import { config } from "@/config/wagmi";
import { type Abi } from "viem"; // Added to fix the 'abi: any' error

/**
 * Helper to batch multiple contract reads efficiently
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function batchReadContracts<T>(contracts: any[]): Promise<T[]> {
  try {
    const results = await readContracts(config, {
      contracts,
    });
    // Wagmi results often include a status, here we map to the raw result
    return results.map((result) => result.result as T);
  } catch (error) {
    console.error("Batch read error:", error);
    return [];
  }
}

/**
 * Fetch multiple items by ID range
 */
export async function fetchItemsByRange(
  address: `0x${string}`,
  abi: Abi,
  functionName: string,
  startId: number,
  endId: number
) {
  const contracts = Array.from({ length: endId - startId + 1 }, (_, i) => ({
    address,
    abi,
    functionName,
    args: [BigInt(startId + i)],
  }));

  return await batchReadContracts(contracts);
}
