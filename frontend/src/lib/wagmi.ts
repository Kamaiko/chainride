import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { sepolia, hardhat } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "ChainRide",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "development",
  chains: [sepolia, hardhat],
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || undefined),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
});
