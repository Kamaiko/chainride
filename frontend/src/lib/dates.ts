/** Align a Date to midnight UTC and return Unix timestamp (seconds) */
export function toMidnightUTC(date: Date): bigint {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  return BigInt(Math.floor(d.getTime() / 1000));
}

/** Convert a Unix timestamp (seconds) to a JS Date at midnight UTC */
export function fromTimestamp(ts: bigint): Date {
  return new Date(Number(ts) * 1000);
}

/** Format a Date as YYYY-MM-DD */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/** Calculate number of days between two midnight-aligned timestamps */
export function daysBetween(start: bigint, end: bigint): number {
  return Number((end - start) / 86400n);
}
