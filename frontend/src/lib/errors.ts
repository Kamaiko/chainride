import type { TFunction } from "i18next";

/** Extract a user-friendly error message from a contract error */
export function getErrorMessage(error: unknown, t: TFunction): string {
  if (!error || typeof error !== "object") return t("errors.fallback");

  const err = error as Record<string, unknown>;

  // wagmi/viem contract revert errors
  if (err.cause && typeof err.cause === "object") {
    const cause = err.cause as Record<string, unknown>;
    if (cause.name === "ContractFunctionRevertedError" && cause.data) {
      const data = cause.data as Record<string, unknown>;
      const errorName = data.errorName as string;
      const key = `errors.${errorName}`;
      if (errorName && t(key) !== key) {
        return t(key);
      }
    }
  }

  // User rejected
  if (
    err.name === "UserRejectedRequestError" ||
    (err.message as string)?.includes("User rejected")
  ) {
    return t("errors.userRejected");
  }

  // Fallback
  const message = (err.shortMessage || err.message || t("errors.fallback")) as string;
  return message;
}
