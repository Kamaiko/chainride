import { useAccount } from "wagmi";
import { useReservationCount, useReservation, useReturnCar, useCancelReservation, useCar } from "../hooks/useCarRental";
import { useReadContracts } from "wagmi";
import { carRentalConfig } from "../lib/contracts";
import { formatETH } from "../lib/format";
import { fromTimestamp, formatDate } from "../lib/dates";
import TransactionStatus from "../components/TransactionStatus";

export default function MyRentalsPage() {
  const { address, isConnected } = useAccount();
  const { data: resCount } = useReservationCount();

  const n = Number(resCount ?? 0n);
  const contracts = Array.from({ length: n }, (_, i) => ({
    ...carRentalConfig,
    functionName: "getReservation" as const,
    args: [BigInt(i + 1)] as const,
  }));

  const { data: resResults, isLoading } = useReadContracts({
    contracts,
    query: { enabled: n > 0 },
  });

  type Reservation = {
    id: bigint;
    carId: bigint;
    renter: string;
    startDate: bigint;
    endDate: bigint;
    totalPrice: bigint;
    isActive: boolean;
  };

  const myReservations: Reservation[] = (resResults ?? [])
    .map((r) => (r.status === "success" ? (r.result as Reservation) : null))
    .filter((r): r is Reservation =>
      r !== null && r.renter.toLowerCase() === address?.toLowerCase()
    );

  const returnCar = useReturnCar();
  const cancelRes = useCancelReservation();

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Connectez votre portefeuille pour voir vos locations.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mes locations</h1>

      {isLoading && <p className="text-gray-500">Chargement...</p>}

      {!isLoading && myReservations.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">Vous n'avez aucune location.</p>
        </div>
      )}

      <div className="space-y-4">
        {myReservations.map((res) => (
          <ReservationCard
            key={res.id.toString()}
            reservation={res}
            onReturn={() => returnCar.returnCar(res.id)}
            onCancel={() => cancelRes.cancelReservation(res.id)}
            returnPending={returnCar.isPending || returnCar.isConfirming}
            cancelPending={cancelRes.isPending || cancelRes.isConfirming}
          />
        ))}
      </div>

      <TransactionStatus
        isPending={returnCar.isPending || cancelRes.isPending}
        isConfirming={returnCar.isConfirming || cancelRes.isConfirming}
        isSuccess={returnCar.isSuccess || cancelRes.isSuccess}
        hash={returnCar.hash || cancelRes.hash}
        error={returnCar.error || cancelRes.error}
      />
    </div>
  );
}

function ReservationCard({
  reservation,
  onReturn,
  onCancel,
  returnPending,
  cancelPending,
}: {
  reservation: {
    id: bigint;
    carId: bigint;
    startDate: bigint;
    endDate: bigint;
    totalPrice: bigint;
    isActive: boolean;
  };
  onReturn: () => void;
  onCancel: () => void;
  returnPending: boolean;
  cancelPending: boolean;
}) {
  const { data: car } = useCar(reservation.carId);
  const now = BigInt(Math.floor(Date.now() / 1000));
  const canCancel = reservation.isActive && now < reservation.startDate;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">
            {car ? `${car.brand} ${car.model}` : `Voiture #${reservation.carId}`}
          </h3>
          <p className="text-sm text-gray-500">Reservation #{reservation.id.toString()}</p>
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            reservation.isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {reservation.isActive ? "Active" : "Terminee"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Debut</p>
          <p className="font-medium">{formatDate(fromTimestamp(reservation.startDate))}</p>
        </div>
        <div>
          <p className="text-gray-500">Fin</p>
          <p className="font-medium">{formatDate(fromTimestamp(reservation.endDate))}</p>
        </div>
        <div>
          <p className="text-gray-500">Prix total</p>
          <p className="font-medium">{formatETH(reservation.totalPrice)} ETH</p>
        </div>
      </div>

      {reservation.isActive && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={onReturn}
            disabled={returnPending}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            Retourner
          </button>
          {canCancel && (
            <button
              onClick={onCancel}
              disabled={cancelPending}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Annuler
            </button>
          )}
        </div>
      )}
    </div>
  );
}
