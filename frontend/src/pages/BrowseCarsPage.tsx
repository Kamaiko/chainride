import { motion } from "framer-motion";
import { Search, SearchX } from "lucide-react";
import { useCarCount, useAllCars } from "../hooks/useCarRental";
import { extractResults } from "../lib/contractResults";
import type { Car } from "../types/contracts";
import CarCard from "../components/CarCard";
import AnimatedPage from "../components/ui/AnimatedPage";
import PageHeader from "../components/ui/PageHeader";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import EmptyState from "../components/ui/EmptyState";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function BrowseCarsPage() {
  const { data: carCount, isLoading: countLoading } = useCarCount();
  const { data: carsResult, isLoading: carsLoading } = useAllCars(carCount);

  const isLoading = countLoading || carsLoading;
  const cars = extractResults<Car>(carsResult);

  return (
    <AnimatedPage>
      <PageHeader icon={<Search className="h-7 w-7" />} title="Parcourir les autos" />

      {isLoading && <LoadingSkeleton type="card" count={3} />}

      {!isLoading && cars.length === 0 && (
        <EmptyState
          icon={<SearchX className="h-12 w-12" />}
          title="Aucune voiture"
          description="Aucune voiture listee pour le moment. Soyez le premier !"
          actionLabel="Lister une auto"
          actionTo="/list"
        />
      )}

      {cars.length > 0 && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {cars.map((car) => (
            <motion.div key={car.id.toString()} variants={fadeUp}>
              <CarCard
                id={car.id}
                brand={car.brand}
                model={car.model}
                year={car.year}
                dailyPrice={car.dailyPrice}
                owner={car.owner}
                isActive={car.isActive}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatedPage>
  );
}
