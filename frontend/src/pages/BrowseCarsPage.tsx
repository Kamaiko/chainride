import { useCarCount, useAllCars } from "../hooks/useCarRental";
import CarCard from "../components/CarCard";

export default function BrowseCarsPage() {
  const { data: carCount, isLoading: countLoading } = useCarCount();
  const { data: carsResult, isLoading: carsLoading } = useAllCars(carCount);

  const isLoading = countLoading || carsLoading;

  const cars = carsResult
    ?.map((r) => (r.status === "success" ? r.result : null))
    .filter(Boolean) as Array<{
      id: bigint;
      owner: string;
      brand: string;
      model: string;
      year: number;
      dailyPrice: bigint;
      isActive: boolean;
      metadataURI: string;
    }> | undefined;

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

      {!isLoading && (!cars || cars.length === 0) && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">Aucune voiture listee pour le moment.</p>
        </div>
      )}

      {cars && cars.length > 0 && (
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
