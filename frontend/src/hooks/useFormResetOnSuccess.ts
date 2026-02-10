import { useRef, useEffect } from "react";

/**
 * Reset a form exactly once per confirmed transaction.
 * Tracks the last-seen transaction hash to avoid double-reset
 * when isSuccess stays true across re-renders.
 */
export function useFormResetOnSuccess(
  isSuccess: boolean,
  hash: `0x${string}` | undefined,
  onReset: () => void,
) {
  const lastResetHash = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (isSuccess && hash && hash !== lastResetHash.current) {
      lastResetHash.current = hash;
      onReset();
    }
  }, [isSuccess, hash, onReset]);
}
