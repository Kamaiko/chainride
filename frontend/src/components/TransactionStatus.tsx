import { useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";
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
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
        {getErrorMessage(error)}
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700 flex items-center gap-2">
        <Spinner /> En attente de la signature...
      </div>
    );
  }

  if (isConfirming) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 flex items-center gap-2">
        <Spinner /> Transaction en cours de confirmation...
        {hash && <TxLink hash={hash} />}
      </div>
    );
  }

  if (isSuccess && hash) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
        Transaction confirmee ! <TxLink hash={hash} />
      </div>
    );
  }

  return null;
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function TxLink({ hash }: { hash: string }) {
  const chainId = useChainId();

  if (chainId !== sepolia.id) {
    return <span className="font-mono text-xs ml-auto">{hash.slice(0, 10)}...</span>;
  }

  return (
    <a
      href={`https://sepolia.etherscan.io/tx/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="underline font-mono text-xs ml-auto"
    >
      Voir sur Etherscan
    </a>
  );
}
