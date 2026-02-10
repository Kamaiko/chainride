import { useState, useEffect } from "react";

/**
 * Reset a form exactly once per confirmed transaction.
 * Tracks the last-seen transaction hash to avoid double-reset
 * when isSuccess stays true across re-renders.
 */
export function useFormResetOnSuccess(
  isSuccess: boolean,
  hash: `0x${string}` | undefined,
  onReset: () => void
) {
  const [lastResetHash, setLastResetHash] = useState<string>();

  useEffect(() => {
    if (isSuccess && hash && hash !== lastResetHash) {
      setLastResetHash(hash);
      onReset();
    }
  }, [isSuccess, hash, lastResetHash, onReset]);
}
