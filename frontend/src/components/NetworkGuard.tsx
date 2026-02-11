import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { sepolia, hardhat } from "wagmi/chains";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";

const SUPPORTED_CHAIN_IDS = [sepolia.id, hardhat.id];

export default function NetworkGuard() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { t } = useTranslation();

  if (!isConnected) return null;
  if (SUPPORTED_CHAIN_IDS.includes(chainId as (typeof SUPPORTED_CHAIN_IDS)[number])) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <p className="text-amber-300 text-sm font-medium">
            {t("network.unsupported")}
          </p>
        </div>
        <button
          onClick={() => switchChain({ chainId: sepolia.id })}
          className="bg-amber-500/20 text-amber-300 text-sm px-4 py-1.5 rounded-lg border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
        >
          {t("network.switchSepolia")}
        </button>
      </div>
    </div>
  );
}
