import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
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
        <Suspense fallback={<div className="text-center py-16 text-gray-500">Chargement...</div>}>
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
      <footer className="text-center text-sm text-gray-500 py-4 border-t">
        ChainRide &mdash; Location d'autos decentralisee &mdash; IFT-4100/7100
      </footer>
    </div>
  );
}

export default App;
