import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "./components/Navbar";
import NetworkGuard from "./components/NetworkGuard";

const HomePage = lazy(() => import("./pages/HomePage"));
const BrowseCarsPage = lazy(() => import("./pages/BrowseCarsPage"));
const CarDetailPage = lazy(() => import("./pages/CarDetailPage"));
const ListCarPage = lazy(() => import("./pages/ListCarPage"));
const MyRentalsPage = lazy(() => import("./pages/MyRentalsPage"));
const MyListingsPage = lazy(() => import("./pages/MyListingsPage"));

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <NetworkGuard />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowseCarsPage />} />
            <Route path="/car/:carId" element={<CarDetailPage />} />
            <Route path="/list" element={<ListCarPage />} />
            <Route path="/my-rentals" element={<MyRentalsPage />} />
            <Route path="/my-listings" element={<MyListingsPage />} />
          </Routes>
        </Suspense>
      </main>
      <footer className="text-center text-sm text-slate-600 py-4 border-t border-white/5">
        ChainRide &mdash; R&eacute;alis&eacute; par Patrick Patenaude
      </footer>
    </div>
  );
}

export default App;
