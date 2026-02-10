import { useState, useCallback } from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useListCar } from "../hooks/useCarRental";
import { useFormResetOnSuccess } from "../hooks/useFormResetOnSuccess";
import TransactionStatus from "../components/TransactionStatus";

export default function ListCarPage() {
  const { isConnected } = useAccount();
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("2024");
  const [dailyPrice, setDailyPrice] = useState("0.01");
  const [metadataURI, setMetadataURI] = useState("");

  const { listCar, isPending, isConfirming, isSuccess, hash, error } = useListCar();

  const resetForm = useCallback(() => {
    setBrand(""); setModel(""); setYear("2024"); setDailyPrice("0.01"); setMetadataURI("");
  }, []);
  useFormResetOnSuccess(isSuccess, hash, resetForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model || !dailyPrice) return;
    listCar(brand, model, parseInt(year), parseEther(dailyPrice), metadataURI);
  };

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Connectez votre portefeuille pour lister une auto.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Lister une auto</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Toyota"
            required
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Modele</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Camry"
            required
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Annee</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              min="1900"
              max="2100"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix / jour (ETH)</label>
            <input
              type="number"
              value={dailyPrice}
              onChange={(e) => setDailyPrice(e.target.value)}
              step="0.001"
              min="0.001"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URI metadonnees (optionnel)
          </label>
          <input
            type="text"
            value={metadataURI}
            onChange={(e) => setMetadataURI(e.target.value)}
            placeholder="ipfs://Qm..."
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isPending || isConfirming || !brand || !model}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Confirmation..." : isConfirming ? "En cours..." : "Lister l'auto"}
        </button>

        <TransactionStatus
          isPending={isPending}
          isConfirming={isConfirming}
          isSuccess={isSuccess}
          hash={hash}
          error={error}
        />
      </form>
    </div>
  );
}
