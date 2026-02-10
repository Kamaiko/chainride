import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { useState } from "react";
import { parseEther } from "viem";
import { useCar, useCarDepositAmount, useCalculateRentalPrice, useRentCar, useRentCarWithDeposit } from "../hooks/useCarRental";
import { formatETH, shortenAddress } from "../lib/format";
import { toMidnightUTC, daysBetween } from "../lib/dates";
import { getErrorMessage } from "../lib/errors";
import TransactionStatus from "../components/TransactionStatus";

export default function CarDetailPage() {
  const { carId } = useParams<{ carId: string }>();
  const id = BigInt(carId ?? "0");
  const { address } = useAccount();

  const { data: car, isLoading } = useCar(id);
  const { data: depositAmount } = useCarDepositAmount(id);

  const [startStr, setStartStr] = useState("");
  const [endStr, setEndStr] = useState("");

  const startDate = startStr ? toMidnightUTC(new Date(startStr)) : 0n;
  const endDate = endStr ? toMidnightUTC(new Date(endStr)) : 0n;
  const validDates = startDate > 0n && endDate > startDate;

  const { data: rentalPrice } = useCalculateRentalPrice(id, startDate, endDate);
  const deposit = depositAmount ?? 0n;
  const totalCost = (rentalPrice ?? 0n) + deposit;

  const rentV1 = useRentCar();
  const rentV2 = useRentCarWithDeposit();
  const useDeposit = deposit > 0n;
  const rent = useDeposit ? rentV2 : rentV1;

  const handleRent = () => {
    if (!validDates || !rentalPrice) return;
    if (useDeposit) {
      rentV2.rentCarWithDeposit(id, startDate, endDate, totalCost);
    } else {
      rentV1.rentCar(id, startDate, endDate, rentalPrice);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-48 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!car) {
    return <p className="text-red-500">Voiture introuvable (ID: {carId})</p>;
  }

  const isOwner = address?.toLowerCase() === car.owner.toLowerCase();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Car info */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {car.brand} {car.model}
            </h1>
            <p className="text-gray-500">{car.year}</p>
          </div>
          <span
            className={`text-sm font-medium px-3 py-1 rounded-full ${
              car.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {car.isActive ? "Disponible" : "Inactive"}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Prix journalier</p>
            <p className="text-xl font-bold text-blue-600">{formatETH(car.dailyPrice)} ETH</p>
          </div>
          <div>
            <p className="text-gray-500">Depot de garantie</p>
            <p className="text-xl font-bold text-gray-900">
              {deposit > 0n ? `${formatETH(deposit)} ETH` : "Aucun"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Proprietaire</p>
            <p className="font-mono text-sm">{shortenAddress(car.owner)}</p>
          </div>
          <div>
            <p className="text-gray-500">ID</p>
            <p className="font-mono text-sm">#{car.id.toString()}</p>
          </div>
        </div>
      </div>

      {/* Rent form */}
      {car.isActive && !isOwner && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Louer cette auto</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date de debut</label>
              <input
                type="date"
                value={startStr}
                onChange={(e) => setStartStr(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date de fin</label>
              <input
                type="date"
                value={endStr}
                onChange={(e) => setEndStr(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          {validDates && rentalPrice !== undefined && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-1 text-sm">
              <p>Duree : <strong>{daysBetween(startDate, endDate)} jour(s)</strong></p>
              <p>Location : <strong>{formatETH(rentalPrice)} ETH</strong></p>
              {deposit > 0n && <p>Depot : <strong>{formatETH(deposit)} ETH</strong></p>}
              <p className="text-lg font-bold text-blue-700 pt-1">
                Total : {formatETH(totalCost)} ETH
              </p>
            </div>
          )}

          <button
            onClick={handleRent}
            disabled={!validDates || rent.isPending || rent.isConfirming}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {rent.isPending ? "Confirmation..." : rent.isConfirming ? "En cours..." : "Payer et louer"}
          </button>

          <TransactionStatus
            isPending={rent.isPending}
            isConfirming={rent.isConfirming}
            isSuccess={rent.isSuccess}
            hash={rent.hash}
            error={rent.error}
          />
        </div>
      )}

      {isOwner && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          Vous etes le proprietaire de cette voiture. Vous ne pouvez pas la louer.
        </div>
      )}
    </div>
  );
}
