import { useAccount } from "wagmi";
import { useCarCount, useAllCars, useOwnerEarnings, useWithdrawEarnings, useUpdateCar } from "../hooks/useCarRental";
import { extractResults } from "../lib/contractResults";
import type { Car } from "../types/contracts";
import { formatETH } from "../lib/format";
import TransactionStatus from "../components/TransactionStatus";
import { Link } from "react-router-dom";

export default function MyListingsPage() {
  const { address, isConnected } = useAccount();
  const { data: carCount } = useCarCount();
  const { data: carsResult, isLoading } = useAllCars(carCount);
  const { data: earnings } = useOwnerEarnings(address);
  const withdraw = useWithdrawEarnings();

  const myCars = extractResults<Car>(carsResult)
    .filter((c) => c.owner.toLowerCase() === address?.toLowerCase());

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Connectez votre portefeuille pour voir vos annonces.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Mes annonces</h1>
        <Link
          to="/list"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nouvelle annonce
        </Link>
      </div>

      {/* Earnings */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Gains disponibles</p>
            <p className="text-2xl font-bold text-green-600">
              {earnings !== undefined ? formatETH(earnings) : "..."} ETH
            </p>
          </div>
          <button
            onClick={() => withdraw.withdrawEarnings()}
            disabled={!earnings || earnings === 0n || withdraw.isPending || withdraw.isConfirming}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {withdraw.isPending ? "Signature..." : withdraw.isConfirming ? "Confirmation..." : "Retirer"}
          </button>
        </div>
        <TransactionStatus
          isPending={withdraw.isPending}
          isConfirming={withdraw.isConfirming}
          isSuccess={withdraw.isSuccess}
          hash={withdraw.hash}
          error={withdraw.error}
        />
      </div>

      {/* Cars list */}
      {isLoading && <p className="text-gray-500">Chargement...</p>}

      {!isLoading && myCars.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Vous n'avez aucune auto listee.</p>
        </div>
      )}

      <div className="space-y-4">
        {myCars.map((car) => (
          <CarListingCard key={car.id.toString()} car={car} />
        ))}
      </div>
    </div>
  );
}

function CarListingCard({ car }: { car: Car }) {
  const update = useUpdateCar();

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <Link to={`/car/${car.id}`} className="font-semibold text-gray-900 hover:text-blue-600">
            {car.brand} {car.model} ({car.year})
          </Link>
          <p className="text-sm text-gray-500">#{car.id.toString()} &middot; {formatETH(car.dailyPrice)} ETH/jour</p>
        </div>
        <button
          onClick={() => update.updateCar(car.id, car.dailyPrice, !car.isActive)}
          disabled={update.isPending || update.isConfirming}
          className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
            car.isActive
              ? "border-red-200 text-red-600 hover:bg-red-50"
              : "border-green-200 text-green-600 hover:bg-green-50"
          }`}
        >
          {update.isPending ? "Signature..." : update.isConfirming ? "Confirmation..." : car.isActive ? "Desactiver" : "Activer"}
        </button>
      </div>
      <TransactionStatus
        isPending={update.isPending}
        isConfirming={update.isConfirming}
        isSuccess={update.isSuccess}
        hash={update.hash}
        error={update.error}
      />
    </div>
  );
}
