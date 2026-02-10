import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { sepolia, hardhat } from "wagmi/chains";

const SUPPORTED_CHAIN_IDS = [sepolia.id, hardhat.id];

export default function NetworkGuard() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  if (!isConnected) return null;
  if (SUPPORTED_CHAIN_IDS.includes(chainId)) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-amber-800 text-sm font-medium">
          Reseau non supporte. Veuillez basculer vers Sepolia ou Hardhat local.
        </p>
        <button
          onClick={() => switchChain({ chainId: sepolia.id })}
          className="bg-amber-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-amber-700 transition-colors"
        >
          Basculer vers Sepolia
        </button>
      </div>
    </div>
  );
}
