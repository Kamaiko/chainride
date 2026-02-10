import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { carRentalConfig } from "../lib/contracts";

// ─── READ HOOKS ───

export function useCarCount() {
  return useReadContract({
    ...carRentalConfig,
    functionName: "getCarCount",
  });
}

export function useReservationCount() {
  return useReadContract({
    ...carRentalConfig,
    functionName: "getReservationCount",
  });
}

export function useCar(carId: bigint) {
  return useReadContract({
    ...carRentalConfig,
    functionName: "getCar",
    args: [carId],
  });
}

export function useReservation(reservationId: bigint) {
  return useReadContract({
    ...carRentalConfig,
    functionName: "getReservation",
    args: [reservationId],
  });
}

export function useIsCarAvailable(carId: bigint, startDate: bigint, endDate: bigint) {
  return useReadContract({
    ...carRentalConfig,
    functionName: "isCarAvailable",
    args: [carId, startDate, endDate],
    query: { enabled: startDate > 0n && endDate > 0n },
  });
}

export function useCalculateRentalPrice(carId: bigint, startDate: bigint, endDate: bigint) {
  return useReadContract({
    ...carRentalConfig,
    functionName: "calculateRentalPrice",
    args: [carId, startDate, endDate],
    query: { enabled: startDate > 0n && endDate > 0n },
  });
}

export function useOwnerEarnings(address: `0x${string}` | undefined) {
  return useReadContract({
    ...carRentalConfig,
    functionName: "getOwnerEarnings",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useCarReservations(carId: bigint) {
  return useReadContract({
    ...carRentalConfig,
    functionName: "getCarReservations",
    args: [carId],
  });
}

// V2 reads
export function useCarDepositAmount(carId: bigint) {
  return useReadContract({
    ...carRentalConfig,
    functionName: "carDepositAmounts",
    args: [carId],
  });
}

export function useVersion() {
  return useReadContract({
    ...carRentalConfig,
    functionName: "getVersion",
  });
}

export function usePlatformFeePercent() {
  return useReadContract({
    ...carRentalConfig,
    functionName: "platformFeePercent",
  });
}

// ─── Multi-car fetch ───

export function useAllCars(count: bigint | undefined) {
  const n = Number(count ?? 0n);
  const contracts = Array.from({ length: n }, (_, i) => ({
    ...carRentalConfig,
    functionName: "getCar" as const,
    args: [BigInt(i + 1)] as const,
  }));

  return useReadContracts({
    contracts,
    query: { enabled: n > 0 },
  });
}

// ─── WRITE HOOKS ───

export function useListCar() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const listCar = (brand: string, model: string, year: number, dailyPrice: bigint, metadataURI: string) => {
    writeContract({
      ...carRentalConfig,
      functionName: "listCar",
      args: [brand, model, year, dailyPrice, metadataURI],
    });
  };

  return { listCar, isPending, isConfirming, isSuccess, hash, error };
}

export function useRentCar() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const rentCar = (carId: bigint, startDate: bigint, endDate: bigint, value: bigint) => {
    writeContract({
      ...carRentalConfig,
      functionName: "rentCar",
      args: [carId, startDate, endDate],
      value,
    });
  };

  return { rentCar, isPending, isConfirming, isSuccess, hash, error };
}

export function useRentCarWithDeposit() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const rentCarWithDeposit = (carId: bigint, startDate: bigint, endDate: bigint, value: bigint) => {
    writeContract({
      ...carRentalConfig,
      functionName: "rentCarWithDeposit",
      args: [carId, startDate, endDate],
      value,
    });
  };

  return { rentCarWithDeposit, isPending, isConfirming, isSuccess, hash, error };
}

export function useReturnCar() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const returnCar = (reservationId: bigint) => {
    writeContract({
      ...carRentalConfig,
      functionName: "returnCar",
      args: [reservationId],
    });
  };

  return { returnCar, isPending, isConfirming, isSuccess, hash, error };
}

export function useCancelReservation() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const cancelReservation = (reservationId: bigint) => {
    writeContract({
      ...carRentalConfig,
      functionName: "cancelReservation",
      args: [reservationId],
    });
  };

  return { cancelReservation, isPending, isConfirming, isSuccess, hash, error };
}

export function useWithdrawEarnings() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdrawEarnings = () => {
    writeContract({
      ...carRentalConfig,
      functionName: "withdrawEarnings",
    });
  };

  return { withdrawEarnings, isPending, isConfirming, isSuccess, hash, error };
}

export function useUpdateCar() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const updateCar = (carId: bigint, newDailyPrice: bigint, isActive: boolean) => {
    writeContract({
      ...carRentalConfig,
      functionName: "updateCar",
      args: [carId, newDailyPrice, isActive],
    });
  };

  return { updateCar, isPending, isConfirming, isSuccess, hash, error };
}
