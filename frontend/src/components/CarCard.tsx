import { Link } from "react-router-dom";
import { formatETH } from "../lib/format";
import { shortenAddress } from "../lib/format";

interface CarCardProps {
  id: bigint;
  brand: string;
  model: string;
  year: number;
  dailyPrice: bigint;
  owner: string;
  isActive: boolean;
}

export default function CarCard({ id, brand, model, year, dailyPrice, owner, isActive }: CarCardProps) {
  return (
    <Link
      to={`/car/${id}`}
      className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow p-5 block"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">
            {brand} {model}
          </h3>
          <p className="text-sm text-gray-500">{year}</p>
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {isActive ? "Disponible" : "Inactive"}
        </span>
      </div>

      <div className="flex items-end justify-between mt-4">
        <div>
          <p className="text-2xl font-bold text-blue-600">{formatETH(dailyPrice)} ETH</p>
          <p className="text-xs text-gray-400">par jour</p>
        </div>
        <p className="text-xs text-gray-400">
          Proprio: {shortenAddress(owner)}
        </p>
      </div>
    </Link>
  );
}
