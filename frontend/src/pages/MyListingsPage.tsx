import { useAccount } from "wagmi";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutList, Car, Wallet, ArrowDownToLine, Power, Plus } from "lucide-react";
import { useCarCount, useAllCars, useOwnerEarnings, useWithdrawEarnings, useUpdateCar } from "../hooks/useCarRental";
import { extractResults } from "../lib/contractResults";
import type { Car as CarType } from "../types/contracts";
import { formatETH } from "../lib/format";
import TransactionStatus from "../components/TransactionStatus";
import AnimatedPage from "../components/ui/AnimatedPage";
import PageHeader from "../components/ui/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import EmptyState from "../components/ui/EmptyState";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import TransactionButton from "../components/ui/TransactionButton";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function MyListingsPage() {
  const { address, isConnected } = useAccount();
  const { data: carCount } = useCarCount();
  const { data: carsResult, isLoading } = useAllCars(carCount);
  const { data: earnings } = useOwnerEarnings(address);
  const withdraw = useWithdrawEarnings();

  const myCars = extractResults<CarType>(carsResult)
    .filter((c) => c.owner.toLowerCase() === address?.toLowerCase());

  if (!isConnected) {
    return (
      <AnimatedPage>
        <EmptyState
          icon={<Wallet className="h-12 w-12" />}
          title="Portefeuille requis"
          description="Connectez votre portefeuille pour voir vos annonces."
        />
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <PageHeader
        icon={<LayoutList className="h-7 w-7" />}
        title="Mes annonces"
        action={
          <Link to="/list" className="gradient-btn px-4 py-2 text-sm flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Nouvelle annonce
          </Link>
        }
      />

      <div className="space-y-8">
        {/* Earnings */}
        <GlassCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-slate-500">Gains disponibles</p>
                <p className="text-2xl font-bold gradient-text">
                  {earnings !== undefined ? formatETH(earnings) : "..."} ETH
                </p>
              </div>
            </div>
            <TransactionButton
              onClick={() => withdraw.withdrawEarnings()}
              disabled={!earnings || earnings === 0n}
              isPending={withdraw.isPending}
              isConfirming={withdraw.isConfirming}
              variant="success"
              icon={<ArrowDownToLine className="h-4 w-4" />}
            >
              Retirer
            </TransactionButton>
          </div>
          <TransactionStatus
            isPending={withdraw.isPending}
            isConfirming={withdraw.isConfirming}
            isSuccess={withdraw.isSuccess}
            hash={withdraw.hash}
            error={withdraw.error}
          />
        </GlassCard>

        {/* Cars list */}
        {isLoading && <LoadingSkeleton type="list-item" count={3} />}

        {!isLoading && myCars.length === 0 && (
          <EmptyState
            icon={<Car className="h-12 w-12" />}
            title="Aucune annonce"
            description="Vous n'avez aucune auto listee."
            actionLabel="Lister une auto"
            actionTo="/list"
          />
        )}

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {myCars.map((car) => (
            <motion.div key={car.id.toString()} variants={fadeUp}>
              <CarListingCard car={car} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AnimatedPage>
  );
}

function CarListingCard({ car }: { car: CarType }) {
  const update = useUpdateCar();

  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <div>
          <Link to={`/car/${car.id}`} className="font-semibold text-white hover:text-primary transition-colors">
            {car.brand} {car.model} ({car.year})
          </Link>
          <p className="text-sm text-slate-500">
            #{car.id.toString()} &middot; {formatETH(car.dailyPrice)} ETH/jour
          </p>
        </div>
        <TransactionButton
          onClick={() => update.updateCar(car.id, car.dailyPrice, !car.isActive)}
          isPending={update.isPending}
          isConfirming={update.isConfirming}
          variant={car.isActive ? "danger" : "success"}
          size="sm"
          icon={<Power className="h-3.5 w-3.5" />}
        >
          {car.isActive ? "Desactiver" : "Activer"}
        </TransactionButton>
      </div>
      <TransactionStatus
        isPending={update.isPending}
        isConfirming={update.isConfirming}
        isSuccess={update.isSuccess}
        hash={update.hash}
        error={update.error}
      />
    </GlassCard>
  );
}
