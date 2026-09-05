import { motion } from "framer-motion";

// App'ens forside.
// Lige nu viser den kun titlen. Vaner, point, streaks og to-do liste
// kommer i de næste faser - se PLAN.md.
export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center gap-4 p-6">
      {/* motion.h1 er en almindelig overskrift, der også kan animeres.
          "initial" = hvordan den ser ud før animationen.
          "animate" = hvordan den ender.
          Her toner titlen ind og glider lidt op, når siden åbnes. */}
      <motion.h1
        className="text-4xl font-bold text-emerald-400"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Vane-app
      </motion.h1>

      <p className="text-slate-400">
        Fase 0 er på plads: React, TypeScript, Vite, Tailwind og Framer Motion virker.
      </p>
    </div>
  );
}
