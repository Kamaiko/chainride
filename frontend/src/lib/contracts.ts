import { CarRentalABI } from "./abi";

// After deploying to Sepolia, replace this with the actual proxy address
// For local development, deploy with `npx hardhat run scripts/deploy.ts --network localhost`
export const CAR_RENTAL_ADDRESS =
  (import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`) ||
  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // default: localhost deploy

export const carRentalConfig = {
  address: CAR_RENTAL_ADDRESS,
  abi: CarRentalABI,
} as const;
