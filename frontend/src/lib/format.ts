import { formatEther } from "viem";

/** Format wei to ETH with fixed decimals */
export function formatETH(wei: bigint, decimals = 4): string {
  const eth = formatEther(wei);
  const num = parseFloat(eth);
  return num.toFixed(decimals);
}

/** Shorten an Ethereum address: 0x1234...abcd */
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
