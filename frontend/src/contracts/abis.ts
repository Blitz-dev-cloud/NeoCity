export { DeFiTokenABI } from "./DeFiToken";
export { IdentityRegistryABI } from "./IdentityRegistry";
export { DeFiBankABI } from "./DeFiBank";
export { VotingABI } from "./Voting";
export { GrievanceABI } from "./Grievance";
export { EHRRegistryABI } from "./EHRRegistry";
export { SupplyChainABI } from "./SupplyChain";
export { TrafficLogABI } from "./TrafficLog";

import { DeFiTokenABI } from "./DeFiToken";
import { IdentityRegistryABI } from "./IdentityRegistry";
import { DeFiBankABI } from "./DeFiBank";
import { VotingABI } from "./Voting";
import { GrievanceABI } from "./Grievance";
import { EHRRegistryABI } from "./EHRRegistry";
import { SupplyChainABI } from "./SupplyChain";
import { TrafficLogABI } from "./TrafficLog";

export const contractABIs = {
  DeFiToken: DeFiTokenABI,
  IdentityRegistry: IdentityRegistryABI,
  DeFiBank: DeFiBankABI,
  Voting: VotingABI,
  Grievance: GrievanceABI,
  EHRRegistry: EHRRegistryABI,
  SupplyChain: SupplyChainABI,
  TrafficLog: TrafficLogABI,
} as const;
