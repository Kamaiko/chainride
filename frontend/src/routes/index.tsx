import { createFileRoute, Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Plus,
  Car,
  CalendarCheck,
  FileCode,
  ArrowLeftRight,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { useCarCount, useReservationCount, useVersion } from "../hooks/useCarRental";
import { staggerSlow, fadeUpSlow } from "../lib/animations";
import AnimatedPage from "../components/ui/AnimatedPage";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { isConnected } = useAccount();
  const { t } = useTranslation();
  const { data: carCount } = useCarCount();
  const { data: reservationCount } = useReservationCount();
  const { data: version } = useVersion();

  return (
    <AnimatedPage>
      <div className="space-y-20">
        {/* Hero */}
        <section className="text-center py-20 sm:py-24">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-5xl sm:text-6xl font-extrabold mb-4"
          >
            <span className="text-white">Chain</span>
            <span className="gradient-text">Ride</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto"
          >
            {t("home.hero.subtitle")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="flex justify-center gap-4"
          >
            <Link to="/browse" className="gradient-btn px-6 py-3 flex items-center gap-2">
              {t("home.hero.browse")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {isConnected && (
              <Link
                to="/list"
                className="glass px-6 py-3 font-semibold text-slate-200 hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {t("home.hero.list")}
              </Link>
            )}
          </motion.div>
        </section>

        {/* Features */}
        <motion.section
          variants={staggerSlow}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass-subtle p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div variants={fadeUpSlow} className="flex items-start gap-3">
                <div className="shrink-0">
                  <ArrowLeftRight className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{t("home.feature.p2p.title")}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {t("home.feature.p2p.desc")}
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={fadeUpSlow}
                className="flex items-start gap-3 md:border-l md:border-white/5 md:pl-8"
              >
                <div className="shrink-0">
                  <Eye className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{t("home.feature.traceable.title")}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {t("home.feature.traceable.desc")}
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={fadeUpSlow}
                className="flex items-start gap-3 md:border-l md:border-white/5 md:pl-8"
              >
                <div className="shrink-0">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{t("home.feature.secure.title")}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {t("home.feature.secure.desc")}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Stats */}
        <motion.section
          variants={staggerSlow}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <div className="glass-subtle p-6 max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
              <motion.div variants={fadeUpSlow} className="flex items-center gap-3">
                <Car className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {carCount?.toString() ?? "..."}
                  </p>
                  <p className="text-slate-500 text-xs">{t("home.stats.cars")}</p>
                </div>
              </motion.div>

              <motion.div variants={fadeUpSlow} className="flex items-center gap-3">
                <CalendarCheck className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {reservationCount?.toString() ?? "..."}
                  </p>
                  <p className="text-slate-500 text-xs">{t("home.stats.reservations")}</p>
                </div>
              </motion.div>

              <motion.div variants={fadeUpSlow} className="flex items-center gap-3">
                <FileCode className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-white">{version ?? "..."}</p>
                  <p className="text-slate-500 text-xs">{t("home.stats.version")}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </div>
    </AnimatedPage>
  );
}
