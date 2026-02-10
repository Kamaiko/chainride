import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { useCarCount, useReservationCount, useVersion } from "../hooks/useCarRental";

export default function HomePage() {
  const { isConnected } = useAccount();
  const { data: carCount } = useCarCount();
  const { data: reservationCount } = useReservationCount();
  const { data: version } = useVersion();

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-16">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          Chain<span className="text-blue-600">Ride</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Location de voitures decentralisee sur Ethereum. Listez votre auto, louez en
          toute transparence, sans intermediaire.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/browse"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Parcourir les autos
          </Link>
          {isConnected && (
            <Link
              to="/list"
              className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Lister une auto
            </Link>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Voitures listees" value={carCount?.toString() ?? "..."} />
        <StatCard label="Reservations" value={reservationCount?.toString() ?? "..."} />
        <StatCard label="Version du contrat" value={version ?? "..."} />
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          title="Sans intermediaire"
          description="Les paiements vont directement au proprietaire via le smart contract. Aucun tiers."
        />
        <FeatureCard
          title="Transparent"
          description="Toutes les transactions sont verifiables sur la blockchain Ethereum (Sepolia)."
        />
        <FeatureCard
          title="Securise"
          description="Depot de garantie, protection contre la reentrance, et controle d'acces OpenZeppelin."
        />
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
      <p className="text-3xl font-bold text-blue-600">{value}</p>
      <p className="text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
