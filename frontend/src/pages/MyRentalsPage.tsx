import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { Key, CalendarX, CalendarDays, Coins, RotateCcw, X, Wallet } from "lucide-react";
import {
  useReservationCount,
  useAllReservations,
  useReturnCar,
  useCancelReservation,
  useCar,
} from "../hooks/useCarRental";
import { extractResults } from "../lib/contractResults";
import type { Reservation } from "../types/contracts";
import { formatETH } from "../lib/format";
import { fromTimestamp, formatDate } from "../lib/dates";
import TransactionStatus from "../components/TransactionStatus";
import AnimatedPage from "../components/ui/AnimatedPage";
import PageHeader from "../components/ui/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import TransactionButton from "../components/ui/TransactionButton";
import { stagger, fadeUp } from "../lib/animations";

export default function MyRentalsPage() {
  const { address, isConnected } = useAccount();
  const { data: resCount } = useReservationCount();
  const { data: resResults, isLoading } = useAllReservations(resCount);

  const myReservations = extractResults<Reservation>(resResults).filter(
    (r) => r.renter.toLowerCase() === address?.toLowerCase(),
  );

  if (!isConnected) {
    return (
      <AnimatedPage>
        <EmptyState
          icon={<Wallet className="h-12 w-12" />}
          title="Portefeuille requis"
          description="Connectez votre portefeuille pour voir vos locations."
        />
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <PageHeader icon={<Key className="h-7 w-7" />} title="Mes locations" />

      {isLoading && <LoadingSkeleton type="list-item" count={3} />}

      {!isLoading && myReservations.length === 0 && (
        <EmptyState
          icon={<CalendarX className="h-12 w-12" />}
          title="Aucune location"
          description="Vous n'avez aucune location. Parcourez les autos disponibles !"
          actionLabel="Parcourir"
          actionTo="/browse"
        />
      )}

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        {myReservations.map((res) => (
          <motion.div key={res.id.toString()} variants={fadeUp}>
            <ReservationCard reservation={res} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatedPage>
  );
}

function ReservationCard({ reservation }: { reservation: Reservation }) {
  const { data: car } = useCar(reservation.carId);
  const returnCar = useReturnCar();
  const cancelRes = useCancelReservation();

  const now = BigInt(Math.floor(Date.now() / 1000));
  const canCancel = reservation.isActive && now < reservation.startDate;

  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-white">
            {car ? `${car.brand} ${car.model}` : `Voiture #${reservation.carId}`}
          </h3>
          <p className="text-sm text-slate-500">Reservation #{reservation.id.toString()}</p>
        </div>
        <Badge variant={reservation.isActive ? "info" : "neutral"}>
          {reservation.isActive ? "Active" : "Terminee"}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm mt-3">
        <div className="flex items-start gap-1.5">
          <CalendarDays className="h-4 w-4 text-slate-500 mt-0.5" />
          <div>
            <p className="text-slate-500">Debut</p>
            <p className="font-medium text-slate-300">
              {formatDate(fromTimestamp(reservation.startDate))}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-1.5">
          <CalendarDays className="h-4 w-4 text-slate-500 mt-0.5" />
          <div>
            <p className="text-slate-500">Fin</p>
            <p className="font-medium text-slate-300">
              {formatDate(fromTimestamp(reservation.endDate))}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-1.5">
          <Coins className="h-4 w-4 text-slate-500 mt-0.5" />
          <div>
            <p className="text-slate-500">Prix total</p>
            <p className="font-medium text-slate-300">{formatETH(reservation.totalPrice)} ETH</p>
          </div>
        </div>
      </div>

      {reservation.isActive && (
        <div className="flex gap-2 mt-3">
          <TransactionButton
            onClick={() => returnCar.returnCar(reservation.id)}
            isPending={returnCar.isPending}
            isConfirming={returnCar.isConfirming}
            variant="success"
            size="sm"
            icon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Retourner
          </TransactionButton>
          {canCancel && (
            <TransactionButton
              onClick={() => cancelRes.cancelReservation(reservation.id)}
              isPending={cancelRes.isPending}
              isConfirming={cancelRes.isConfirming}
              variant="danger"
              size="sm"
              icon={<X className="h-3.5 w-3.5" />}
            >
              Annuler
            </TransactionButton>
          )}
        </div>
      )}

      <div className="mt-3 space-y-2">
        <TransactionStatus
          isPending={returnCar.isPending}
          isConfirming={returnCar.isConfirming}
          isSuccess={returnCar.isSuccess}
          hash={returnCar.hash}
          error={returnCar.error}
        />
        <TransactionStatus
          isPending={cancelRes.isPending}
          isConfirming={cancelRes.isConfirming}
          isSuccess={cancelRes.isSuccess}
          hash={cancelRes.hash}
          error={cancelRes.error}
        />
      </div>
    </GlassCard>
  );
}
