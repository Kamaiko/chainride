import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { ArrowRight, Plus, Car, CalendarCheck, FileCode, ArrowLeftRight, Eye, ShieldCheck } from "lucide-react";
import { useCarCount, useReservationCount, useVersion } from "../hooks/useCarRental";
import AnimatedPage from "../components/ui/AnimatedPage";
import GlassCard from "../components/ui/GlassCard";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HomePage() {
  const { isConnected } = useAccount();
  const { data: carCount } = useCarCount();
  const { data: reservationCount } = useReservationCount();
  const { data: version } = useVersion();

  return (
    <AnimatedPage>
      <div className="space-y-16">
        {/* Hero */}
        <section className="text-center py-16">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-5xl sm:text-6xl font-extrabold mb-4"
          >
            <span className="gradient-text">ChainRide</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto"
          >
            Location de voitures decentralisee sur Ethereum. Listez votre auto, louez en
            toute transparence, sans intermediaire.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="flex justify-center gap-4"
          >
            <Link
              to="/browse"
              className="gradient-btn px-6 py-3 flex items-center gap-2"
            >
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

        {/* Stats */}
        <motion.section
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          <motion.div variants={fadeUp}>
            <GlassCard>
              <div className="text-center space-y-2">
                <Car className="h-6 w-6 text-primary mx-auto" />
                <p className="text-3xl font-bold gradient-text">{carCount?.toString() ?? "..."}</p>
                <p className="text-slate-500 text-sm">Voitures listees</p>
              </div>
            </GlassCard>
          </motion.div>
          <motion.div variants={fadeUp}>
            <GlassCard>
              <div className="text-center space-y-2">
                <CalendarCheck className="h-6 w-6 text-primary mx-auto" />
                <p className="text-3xl font-bold gradient-text">{reservationCount?.toString() ?? "..."}</p>
                <p className="text-slate-500 text-sm">Reservations</p>
              </div>
            </GlassCard>
          </motion.div>
          <motion.div variants={fadeUp}>
            <GlassCard>
              <div className="text-center space-y-2">
                <FileCode className="h-6 w-6 text-primary mx-auto" />
                <p className="text-3xl font-bold gradient-text">{version ?? "..."}</p>
                <p className="text-slate-500 text-sm">Version du contrat</p>
              </div>
            </GlassCard>
          </motion.div>
        </motion.section>

        {/* Features */}
        <motion.section
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div variants={fadeUp}>
            <GlassCard>
              <ArrowLeftRight className="h-6 w-6 text-accent mb-3" />
              <h3 className="font-semibold text-lg text-white mb-2">Sans intermediaire</h3>
              <p className="text-slate-400 text-sm">
                Les paiements vont directement au proprietaire via le smart contract. Aucun tiers.
              </p>
            </GlassCard>
          </motion.div>
          <motion.div variants={fadeUp}>
            <GlassCard>
              <Eye className="h-6 w-6 text-accent mb-3" />
              <h3 className="font-semibold text-lg text-white mb-2">Transparent</h3>
              <p className="text-slate-400 text-sm">
                Toutes les transactions sont verifiables sur la blockchain Ethereum (Sepolia).
              </p>
            </GlassCard>
          </motion.div>
          <motion.div variants={fadeUp}>
            <GlassCard>
              <ShieldCheck className="h-6 w-6 text-accent mb-3" />
              <h3 className="font-semibold text-lg text-white mb-2">Securise</h3>
              <p className="text-slate-400 text-sm">
                Depot de garantie, protection contre la reentrance, et controle d'acces OpenZeppelin.
              </p>
            </GlassCard>
          </motion.div>
        </motion.section>
      </div>
    </AnimatedPage>
  );
}
