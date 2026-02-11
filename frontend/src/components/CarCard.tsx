import { Link } from "@tanstack/react-router";
import { Calendar, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatETH, shortenAddress } from "../lib/format";
import type { Car } from "../types/contracts";
import GlassCard from "./ui/GlassCard";
import Badge from "./ui/Badge";

type CarCardProps = Omit<Car, "metadataURI">;

export default function CarCard({
  id,
  brand,
  model,
  year,
  dailyPrice,
  owner,
  isActive,
}: CarCardProps) {
  const { t } = useTranslation();

  return (
    <Link to="/car/$carId" params={{ carId: id.toString() }} className="block">
      <GlassCard hover>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg text-white">
              {brand} {model}
            </h3>
            <p className="text-sm text-slate-400 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {year}
            </p>
          </div>
          <Badge variant={isActive ? "success" : "error"}>
            {isActive ? t("car.available") : t("car.inactive")}
          </Badge>
        </div>

        <div className="flex items-end justify-between mt-4">
          <div>
            <p className="text-2xl font-bold gradient-text">{formatETH(dailyPrice)} ETH</p>
            <p className="text-xs text-slate-500">{t("car.perDay")}</p>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {shortenAddress(owner)}
          </p>
        </div>
      </GlassCard>
    </Link>
  );
}
