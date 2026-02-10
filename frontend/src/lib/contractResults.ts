/**
 * Extract successful results from a useReadContracts batch call.
 * Filters out failed calls and casts results to the expected type.
 */
export function extractResults<T>(
  data: readonly { status: string; result?: unknown }[] | undefined,
): T[] {
  if (!data) return [];
  return data
    .map((r) => (r.status === "success" ? (r.result as T) : null))
    .filter((r): r is T => r !== null);
}
