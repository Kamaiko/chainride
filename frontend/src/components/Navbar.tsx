import { Link, useLocation } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const NAV_LINKS = [
  { to: "/browse", label: "Parcourir" },
  { to: "/list", label: "Lister une auto" },
  { to: "/my-rentals", label: "Mes locations" },
  { to: "/my-listings", label: "Mes annonces" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { isConnected } = useAccount();

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
          ChainRide
        </Link>

        {isConnected && (
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === to
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        )}

        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus="address"
        />
      </div>
    </nav>
  );
}
