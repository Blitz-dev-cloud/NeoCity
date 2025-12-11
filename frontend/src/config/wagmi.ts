import { http } from "wagmi";
import { localhost, sepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

// Define Hardhat local network
export const hardhatLocal = {
  ...localhost,
  id: 31337,
  name: "Hardhat Local",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
    public: { http: ["http://127.0.0.1:8545"] },
  },
} as const;

// Wagmi configuration with RainbowKit
export const config = getDefaultConfig({
  appName: "NeoCity Smart City Platform",
  projectId: "60a9b1e1884e696fd31fa3b73636bf74",
  chains: [sepolia, hardhatLocal],
  transports: {
    [sepolia.id]: http(),
    [hardhatLocal.id]: http("http://127.0.0.1:8545"),
  },
  ssr: true,
});
