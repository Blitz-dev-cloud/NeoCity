export const contractAddresses = {
  DeFiToken: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6" as `0x${string}`,
  IdentityRegistry:
    "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318" as `0x${string}`,
  DeFiBank: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788" as `0x${string}`,
  Voting: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e" as `0x${string}`,
  Grievance: "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0" as `0x${string}`,
  EHRRegistry: "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82" as `0x${string}`,
  SupplyChain: "0x9A676e781A523b5d0C0e43731313A708CB607508" as `0x${string}`,
  TrafficLog: "0x0B306BF915C4d645ff596e518fAf3F9669b97016" as `0x${string}`,
} as const;

export type ContractName = keyof typeof contractAddresses;
