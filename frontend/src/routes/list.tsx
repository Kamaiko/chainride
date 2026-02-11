import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useTranslation } from "react-i18next";
import { PlusCircle, Wallet } from "lucide-react";
import { useListCar } from "../hooks/useCarRental";
import { useFormResetOnSuccess } from "../hooks/useFormResetOnSuccess";
import TransactionStatus from "../components/TransactionStatus";
import AnimatedPage from "../components/ui/AnimatedPage";
import PageHeader from "../components/ui/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import EmptyState from "../components/ui/EmptyState";
import TransactionButton from "../components/ui/TransactionButton";

export const Route = createFileRoute("/list")({
  component: ListCarPage,
});

function ListCarPage() {
  const { isConnected } = useAccount();
  const { t } = useTranslation();
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("2024");
  const [dailyPrice, setDailyPrice] = useState("0.01");
  const [metadataURI, setMetadataURI] = useState("");

  const { listCar, isPending, isConfirming, isSuccess, hash, error } = useListCar();

  const resetForm = useCallback(() => {
    setBrand("");
    setModel("");
    setYear("2024");
    setDailyPrice("0.01");
    setMetadataURI("");
  }, []);
  useFormResetOnSuccess(isSuccess, hash, resetForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model || !dailyPrice) return;
    listCar(brand, model, parseInt(year), parseEther(dailyPrice), metadataURI);
  };

  if (!isConnected) {
    return (
      <AnimatedPage>
        <EmptyState
          icon={<Wallet className="h-12 w-12" />}
          title={t("list.wallet.title")}
          description={t("list.wallet.desc")}
        />
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="max-w-lg mx-auto">
        <PageHeader icon={<PlusCircle className="h-7 w-7" />} title={t("list.title")} />

        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">{t("list.form.brand")}</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Toyota"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">{t("list.form.model")}</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Camry"
                required
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">{t("list.form.year")}</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min="1900"
                  max="2100"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t("list.form.dailyPrice")}
                </label>
                <input
                  type="number"
                  value={dailyPrice}
                  onChange={(e) => setDailyPrice(e.target.value)}
                  step="0.001"
                  min="0.001"
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t("list.form.metadataURI")}
              </label>
              <input
                type="text"
                value={metadataURI}
                onChange={(e) => setMetadataURI(e.target.value)}
                placeholder="ipfs://Qm..."
                className="w-full"
              />
            </div>

            <TransactionButton
              onClick={() => {}}
              isPending={isPending}
              isConfirming={isConfirming}
              disabled={!brand || !model}
              icon={<PlusCircle className="h-4 w-4" />}
              fullWidth
            >
              {t("list.form.submit")}
            </TransactionButton>

            <TransactionStatus
              isPending={isPending}
              isConfirming={isConfirming}
              isSuccess={isSuccess}
              hash={hash}
              error={error}
            />
          </form>
        </GlassCard>
      </div>
    </AnimatedPage>
  );
}
