import { useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { getErrorMessage } from "../lib/errors";

interface TransactionStatusProps {
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  hash: `0x${string}` | undefined;
  error: Error | null;
}

export default function TransactionStatus({
  isPending,
  isConfirming,
  isSuccess,
  hash,
  error,
}: TransactionStatusProps) {
  const { t } = useTranslation();

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400 flex items-start gap-2"
      >
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <span>{getErrorMessage(error, t)}</span>
      </motion.div>
    );
  }

  if (isPending) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-sm text-amber-400 flex items-center gap-2"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("tx.pending")}
      </motion.div>
    );
  }

  if (isConfirming) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-sm text-blue-400 flex items-center gap-2"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("tx.confirming")}
        {hash && <TxLink hash={hash} />}
      </motion.div>
    );
  }

  if (isSuccess && hash) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-sm text-green-400 flex items-center gap-2"
      >
        <CheckCircle className="h-4 w-4" />
        {t("tx.confirmed")}
        <TxLink hash={hash} />
      </motion.div>
    );
  }

  return null;
}

function TxLink({ hash }: { hash: string }) {
  const chainId = useChainId();
  const { t } = useTranslation();

  if (chainId !== sepolia.id) {
    return <span className="font-mono text-xs ml-auto opacity-70">{hash.slice(0, 10)}...</span>;
  }

  return (
    <a
      href={`https://sepolia.etherscan.io/tx/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="underline font-mono text-xs ml-auto hover:opacity-80 transition-opacity"
    >
      {t("tx.viewEtherscan")}
    </a>
  );
}
