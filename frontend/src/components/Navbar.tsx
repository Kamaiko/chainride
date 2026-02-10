import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { AnimatePresence, motion } from "framer-motion";
import { Car, Search, PlusCircle, Key, LayoutList, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { to: "/browse", label: "Parcourir", icon: Search },
  { to: "/list", label: "Lister", icon: PlusCircle },
  { to: "/my-rentals", label: "Locations", icon: Key },
  { to: "/my-listings", label: "Annonces", icon: LayoutList },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { isConnected } = useAccount();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <nav className="bg-white/5 backdrop-blur-xl border-b border-white/8 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <Car className="h-6 w-6 text-primary group-hover:text-accent transition-colors" />
          <span className="text-xl font-bold gradient-text">ChainRide</span>
        </Link>

        {isConnected && (
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === to
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
          {isConnected && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-slate-400 hover:text-white transition-colors"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && isConnected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === to
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
