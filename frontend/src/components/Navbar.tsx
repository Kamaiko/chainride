import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { Car, Search, PlusCircle, Key, LayoutList, Menu, X, Globe } from "lucide-react";

const NAV_ICONS = [Search, PlusCircle, Key, LayoutList] as const;
const NAV_ROUTES = ["/browse", "/list", "/my-rentals", "/my-listings"] as const;
const NAV_KEYS = ["nav.browse", "nav.list", "nav.rentals", "nav.listings"] as const;

function NavLink({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: typeof Search;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
      activeProps={{ className: "bg-white/10 text-white" }}
      inactiveProps={{ className: "text-slate-400 hover:text-white hover:bg-white/5" }}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  const { isConnected } = useAccount();
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const toggleLang = () => i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr");

  const navLinks = NAV_ROUTES.map((route, i) => ({
    to: route,
    label: t(NAV_KEYS[i]),
    icon: NAV_ICONS[i],
  }));

  return (
    <nav className="bg-white/5 backdrop-blur-xl border-b border-white/8 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <Car className="h-6 w-6 text-primary group-hover:text-accent transition-colors" />
          <span className="text-xl font-bold">
            <span className="text-white">Chain</span>
            <span className="gradient-text">Ride</span>
          </span>
        </Link>

        {isConnected && (
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink key={link.to} {...link} />
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 text-sm font-medium px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title={i18n.language === "fr" ? "Switch to English" : "Passer en francais"}
          >
            <Globe className="h-4 w-4" />
            {i18n.language === "fr" ? "EN" : "FR"}
          </button>
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
              {navLinks.map((link) => (
                <NavLink key={link.to} {...link} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
