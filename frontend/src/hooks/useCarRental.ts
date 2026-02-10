import { useEffect } from "react";
import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
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

export function useAllReservations(count: bigint | undefined) {
  const n = Number(count ?? 0n);
  const contracts = Array.from({ length: n }, (_, i) => ({
    ...carRentalConfig,
    functionName: "getReservation" as const,
    args: [BigInt(i + 1)] as const,
  }));

  return useReadContracts({
    contracts,
    query: { enabled: n > 0 },
  });
}

// ─── WRITE HOOK HELPER ───

function useContractWrite() {
  const { data: hash, writeContract, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const queryClient = useQueryClient();

  // Invalidate all contract read caches when a transaction is confirmed
  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['readContract'] });
    }
  }, [isSuccess, queryClient]);

  return { hash, writeContract, isPending, isConfirming, isSuccess, error, reset };
}

// ─── WRITE HOOKS ───

export function useListCar() {
  const { hash, writeContract, isPending, isConfirming, isSuccess, error, reset } = useContractWrite();

  const listCar = (brand: string, model: string, year: number, dailyPrice: bigint, metadataURI: string) => {
    reset();
    writeContract({
      ...carRentalConfig,
      functionName: "listCar",
      args: [brand, model, year, dailyPrice, metadataURI],
    });
  };

  return { listCar, isPending, isConfirming, isSuccess, hash, error, reset };
}

export function useRentCar() {
  const { hash, writeContract, isPending, isConfirming, isSuccess, error, reset } = useContractWrite();

  const rentCar = (carId: bigint, startDate: bigint, endDate: bigint, value: bigint) => {
    reset();
    writeContract({
      ...carRentalConfig,
      functionName: "rentCar",
      args: [carId, startDate, endDate],
      value,
    });
  };

  return { rentCar, isPending, isConfirming, isSuccess, hash, error, reset };
}

export function useRentCarWithDeposit() {
  const { hash, writeContract, isPending, isConfirming, isSuccess, error, reset } = useContractWrite();

  const rentCarWithDeposit = (carId: bigint, startDate: bigint, endDate: bigint, value: bigint) => {
    reset();
    writeContract({
      ...carRentalConfig,
      functionName: "rentCarWithDeposit",
      args: [carId, startDate, endDate],
      value,
    });
  };

  return { rentCarWithDeposit, isPending, isConfirming, isSuccess, hash, error, reset };
}

export function useReturnCar() {
  const { hash, writeContract, isPending, isConfirming, isSuccess, error, reset } = useContractWrite();

  const returnCar = (reservationId: bigint) => {
    reset();
    writeContract({
      ...carRentalConfig,
      functionName: "returnCar",
      args: [reservationId],
    });
  };

  return { returnCar, isPending, isConfirming, isSuccess, hash, error, reset };
}

export function useCancelReservation() {
  const { hash, writeContract, isPending, isConfirming, isSuccess, error, reset } = useContractWrite();

  const cancelReservation = (reservationId: bigint) => {
    reset();
    writeContract({
      ...carRentalConfig,
      functionName: "cancelReservation",
      args: [reservationId],
    });
  };

  return { cancelReservation, isPending, isConfirming, isSuccess, hash, error, reset };
}

export function useWithdrawEarnings() {
  const { hash, writeContract, isPending, isConfirming, isSuccess, error, reset } = useContractWrite();

  const withdrawEarnings = () => {
    reset();
    writeContract({
      ...carRentalConfig,
      functionName: "withdrawEarnings",
    });
  };

  return { withdrawEarnings, isPending, isConfirming, isSuccess, hash, error, reset };
}

export function useUpdateCar() {
  const { hash, writeContract, isPending, isConfirming, isSuccess, error, reset } = useContractWrite();

  const updateCar = (carId: bigint, newDailyPrice: bigint, isActive: boolean) => {
    reset();
    writeContract({
      ...carRentalConfig,
      functionName: "updateCar",
      args: [carId, newDailyPrice, isActive],
    });
  };

  return { updateCar, isPending, isConfirming, isSuccess, hash, error, reset };
}
