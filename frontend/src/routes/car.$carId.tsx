import { createFileRoute } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Coins, Shield, User, Hash, AlertTriangle } from "lucide-react";
import {
  useCar,
  useCarDepositAmount,
  useCalculateRentalPrice,
  useRentCar,
  useRentCarWithDeposit,
} from "../hooks/useCarRental";
import { useFormResetOnSuccess } from "../hooks/useFormResetOnSuccess";
import { formatETH, shortenAddress } from "../lib/format";
import { toMidnightUTC, daysBetween } from "../lib/dates";
import TransactionStatus from "../components/TransactionStatus";
import AnimatedPage from "../components/ui/AnimatedPage";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import EmptyState from "../components/ui/EmptyState";
import TransactionButton from "../components/ui/TransactionButton";

export const Route = createFileRoute("/car/$carId")({
  component: CarDetailPage,
});

function CarDetailPage() {
  const { carId } = Route.useParams();
  const id = BigInt(carId ?? "0");
  const { address } = useAccount();
  const { t } = useTranslation();

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

  const resetDates = useCallback(() => {
    setStartStr("");
    setEndStr("");
  }, []);
  useFormResetOnSuccess(rent.isSuccess, rent.hash, resetDates);

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
      <AnimatedPage>
        <LoadingSkeleton type="detail" />
      </AnimatedPage>
    );
  }

  if (!car) {
    return (
      <AnimatedPage>
        <EmptyState
          icon={<AlertTriangle className="h-12 w-12" />}
          title={t("detail.notFound.title")}
          description={t("detail.notFound.desc", { id: carId })}
          actionLabel={t("detail.notFound.action")}
          actionTo="/browse"
        />
      </AnimatedPage>
    );
  }

  const isOwner = address?.toLowerCase() === car.owner.toLowerCase();

  return (
    <AnimatedPage>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Car info */}
        <GlassCard>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {car.brand} {car.model}
              </h1>
              <p className="text-slate-400">{car.year}</p>
            </div>
            <Badge variant={car.isActive ? "success" : "error"}>
              {car.isActive ? t("car.available") : t("car.inactive")}
            </Badge>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Coins className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-slate-500">{t("detail.dailyPrice")}</p>
                <p className="text-xl font-bold gradient-text">{formatETH(car.dailyPrice)} ETH</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-slate-500">{t("detail.deposit")}</p>
                <p className="text-xl font-bold text-white">
                  {deposit > 0n ? `${formatETH(deposit)} ETH` : t("detail.depositNone")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-slate-500 mt-0.5" />
              <div>
                <p className="text-slate-500">{t("detail.owner")}</p>
                <p className="font-mono text-sm text-slate-300">{shortenAddress(car.owner)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Hash className="h-4 w-4 text-slate-500 mt-0.5" />
              <div>
                <p className="text-slate-500">{t("detail.id")}</p>
                <p className="font-mono text-sm text-slate-300">#{car.id.toString()}</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Rent form */}
        {car.isActive && !isOwner && (
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">{t("detail.rent.title")}</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">{t("detail.rent.startDate")}</label>
                <input
                  type="date"
                  value={startStr}
                  onChange={(e) => setStartStr(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">{t("detail.rent.endDate")}</label>
                <input
                  type="date"
                  value={endStr}
                  onChange={(e) => setEndStr(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {validDates && rentalPrice !== undefined && (
              <div className="glass-subtle p-4 space-y-1 text-sm mt-4">
                <p className="text-slate-300">
                  {t("detail.rent.duration")} : <strong>{daysBetween(startDate, endDate)} {t("detail.rent.days")}</strong>
                </p>
                <p className="text-slate-300">
                  {t("detail.rent.rental")} : <strong>{formatETH(rentalPrice)} ETH</strong>
                </p>
                {deposit > 0n && (
                  <p className="text-slate-300">
                    {t("detail.rent.depositLabel")} : <strong>{formatETH(deposit)} ETH</strong>
                  </p>
                )}
                <p className="text-lg font-bold gradient-text pt-1">
                  {t("detail.rent.total")} : {formatETH(totalCost)} ETH
                </p>
              </div>
            )}

            <div className="mt-4 space-y-3">
              <TransactionButton
                onClick={handleRent}
                disabled={!validDates}
                isPending={rent.isPending}
                isConfirming={rent.isConfirming}
                icon={<Coins className="h-4 w-4" />}
                fullWidth
              >
                {t("detail.rent.submit")}
              </TransactionButton>

              <TransactionStatus
                isPending={rent.isPending}
                isConfirming={rent.isConfirming}
                isSuccess={rent.isSuccess}
                hash={rent.hash}
                error={rent.error}
              />
            </div>
          </GlassCard>
        )}

        {isOwner && (
          <GlassCard className="border-amber-500/20!">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm">
                {t("detail.ownerWarning")}
              </p>
            </div>
          </GlassCard>
        )}
      </div>
    </AnimatedPage>
  );
}
