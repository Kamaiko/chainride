import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
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

export default function HomePage() {
  const { isConnected } = useAccount();
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
            Location de voitures decentralisee sur Ethereum. Listez votre auto, louez en toute
            transparence, sans intermediaire.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="flex justify-center gap-4"
          >
            <Link to="/browse" className="gradient-btn px-6 py-3 flex items-center gap-2">
              Parcourir les autos
              <ArrowRight className="h-4 w-4" />
            </Link>
            {isConnected && (
              <Link
                to="/list"
                className="glass px-6 py-3 font-semibold text-slate-200 hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Lister une auto
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
                  <h3 className="font-semibold text-white mb-1">Pair-a-pair</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Paiements directs au proprietaire via smart contract. Aucun tiers.
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
                  <h3 className="font-semibold text-white mb-1">Tracable</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Transactions verifiables sur la blockchain Ethereum (Sepolia).
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
                  <h3 className="font-semibold text-white mb-1">Securise</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Depot de garantie, protection reentrance et controle OpenZeppelin.
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
                  <p className="text-slate-500 text-xs">Voitures listees</p>
                </div>
              </motion.div>

              <motion.div variants={fadeUpSlow} className="flex items-center gap-3">
                <CalendarCheck className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {reservationCount?.toString() ?? "..."}
                  </p>
                  <p className="text-slate-500 text-xs">Reservations</p>
                </div>
              </motion.div>

              <motion.div variants={fadeUpSlow} className="flex items-center gap-3">
                <FileCode className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-white">{version ?? "..."}</p>
                  <p className="text-slate-500 text-xs">Version du contrat</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </div>
    </AnimatedPage>
  );
}
