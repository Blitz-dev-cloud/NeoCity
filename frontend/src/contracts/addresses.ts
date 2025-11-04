export const contractAddresses = {
  DeFiToken: "0xF8E5326F6AAce255FD1B39c37b73C4Cbf84cc7Eb" as `0x${string}`,
  IdentityRegistry:
    "0x30696fD733649deDfFA4533A0f24E0f225220908" as `0x${string}`,
  DeFiBank: "0x2ccc92154AAeb3aa462AdbCe0e3b95977C71DDFB" as `0x${string}`,
  Voting: "0xC068A2C5D298634EB0cFB234010a0CF5b61801B1" as `0x${string}`,
  Grievance: "0xbb9f0F5d6727D4B79947dA3773D1CD6880132Ff4" as `0x${string}`,
  EHRRegistry: "0xd83b3F5B898Cfb2c0eb341A435614ce558D81254" as `0x${string}`,
  SupplyChain: "0x8710a7E8D4340F9277152F4Aa002E4369b3048fb" as `0x${string}`,
  TrafficLog: "0x37725B5b09E0dA3b32B219B1B3EAbb73b79BDF6e" as `0x${string}`,
} as const;

// Alias for backward compatibility
export const CONTRACTS = contractAddresses;

export type ContractName = keyof typeof contractAddresses;
