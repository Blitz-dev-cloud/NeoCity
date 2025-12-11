import { readContracts } from "@wagmi/core";
import { config } from "@/config/wagmi";

/**
 * Helper to batch multiple contract reads efficiently
 */
export async function batchReadContracts<T>(contracts: any[]): Promise<T[]> {
  try {
    const results = await readContracts(config, {
      contracts,
    });
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
  abi: any,
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
