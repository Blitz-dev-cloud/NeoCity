import DeFiTokenArtifact from "./DeFiToken.json";
import IdentityRegistryArtifact from "./IdentityRegistry.json";
import DeFiBankArtifact from "./DeFiBank.json";
import VotingArtifact from "./Voting.json";
import GrievanceArtifact from "./Grievance.json";
import EHRRegistryArtifact from "./EHRRegistry.json";
import SupplyChainArtifact from "./SupplyChain.json";
import TrafficLogArtifact from "./TrafficLog.json";

export const DeFiTokenABI = DeFiTokenArtifact.abi;
export const IdentityRegistryABI = IdentityRegistryArtifact.abi;
export const DeFiBankABI = DeFiBankArtifact.abi;
export const VotingABI = VotingArtifact.abi;
export const GrievanceABI = GrievanceArtifact.abi;
export const EHRRegistryABI = EHRRegistryArtifact.abi;
export const SupplyChainABI = SupplyChainArtifact.abi;
export const TrafficLogABI = TrafficLogArtifact.abi;

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
