/** Mirrors CarRentalV1.Car struct from the smart contract */
export type Car = {
  id: bigint;
  owner: string;
  brand: string;
  model: string;
  year: number;
  dailyPrice: bigint;
  isActive: boolean;
  metadataURI: string;
};

/** Mirrors CarRentalV1.Reservation struct from the smart contract */
export type Reservation = {
  id: bigint;
  carId: bigint;
  renter: string;
  startDate: bigint;
  endDate: bigint;
  totalPrice: bigint;
  isActive: boolean;
};
