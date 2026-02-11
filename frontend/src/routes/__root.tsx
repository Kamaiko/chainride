import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import NetworkGuard from "../components/NetworkGuard";

export const Route = createRootRoute({
  component: RootLayout,
  pendingComponent: PendingFallback,
});

function PendingFallback() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function RootLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <NetworkGuard />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
      <footer className="text-center text-sm text-slate-600 py-4 border-t border-white/5">
        ChainRide &mdash; {t("footer.credit")}
      </footer>
    </div>
  );
}
