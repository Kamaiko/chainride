import { useCarCount, useAllCars } from "../hooks/useCarRental";
import { extractResults } from "../lib/contractResults";
import type { Car } from "../types/contracts";
import CarCard from "../components/CarCard";

export default function BrowseCarsPage() {
  const { data: carCount, isLoading: countLoading } = useCarCount();
  const { data: carsResult, isLoading: carsLoading } = useAllCars(carCount);

  const isLoading = countLoading || carsLoading;
  const cars = extractResults<Car>(carsResult);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Parcourir les autos</h1>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border p-5 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && cars.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">Aucune voiture listee pour le moment.</p>
        </div>
      )}

      {cars.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <CarCard
              key={car.id.toString()}
              id={car.id}
              brand={car.brand}
              model={car.model}
              year={car.year}
              dailyPrice={car.dailyPrice}
              owner={car.owner}
              isActive={car.isActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
