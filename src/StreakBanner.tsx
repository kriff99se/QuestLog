import { useState } from "react";

// Runde streak-tal, det er sjovt at ramme.
const MILEPAELE = [3, 7, 14, 30, 60, 100, 200, 365];

// Én dag i uge-sporet.
export type UgeDag = {
  dato: string; // "2026-09-05"
  label: string; // "ma", "ti" ...
  groen: boolean; // var dagen grøn (nåede tærsklen)?
  erIDag: boolean; // er det den dag appen viser lige nu?
  erFremtid: boolean; // ligger dagen senere end i dag?
};

type Props = {
  streak: number; // samlet dags-streak (grønne dage i træk)
  skjoldBrugt: boolean; // reddede streaken en misset dag?
  rekord: number; // den længste streak nogensinde
  taerskel: number; // hvor mange vaner der skal til for en grøn dag
  antalVaner: number; // hvor mange vaner der findes i alt
  gjortIDag: number; // hvor mange vaner der er klaret i dag
  ugensDage: UgeDag[]; // mandag..søndag i den viste uge
  onTaerskel: (ny: number) => void; // kaldes når brugeren ændrer tærsklen
};

// Streak-kortet: stort glødende tal, et uge-spor med flammer,
// og tærskel-indstillingen gemt bag et lille tandhjul.
export function StreakBanner({
  streak,
  skjoldBrugt,
  rekord,
  taerskel,
  antalVaner,
  gjortIDag,
  ugensDage,
  onTaerskel,
}: Props) {
  // Er tærskel-indstillingen foldet ud? Starter skjult.
  const [visIndstilling, setVisIndstilling] = useState(false);

  const groenIDag = gjortIDag >= taerskel;
  const harStreak = streak > 0;

  // Én kort "du er tæt på"-linje: enten hvor lidt der mangler til en grøn
  // dag, eller hvor få dage der er til den næste streak-milepæl.
  let naesteMaal: string;
  if (!groenIDag) {
    const mangler = taerskel - gjortIDag;
    naesteMaal = `Kun ${mangler} ${mangler === 1 ? "vane" : "vaner"} til en grøn dag i dag`;
  } else {
    // Næste runde tal over den nuværende streak (eller næste hundrede).
    const naeste =
      MILEPAELE.find((m) => m > streak) ?? Math.ceil((streak + 1) / 100) * 100;
    const til = naeste - streak;
    naesteMaal = `${til} ${til === 1 ? "dag" : "dage"} til en ${naeste}-dages streak`;
  }

  return (
    <div
      className={
        "flex flex-col gap-4 rounded-2xl border bg-slate-800 p-4 sm:p-5 " +
        (harStreak ? "border-orange-500/40" : "border-slate-700")
      }
      // Blød varm glød om kortet, når man har en streak i gang.
      style={
        harStreak
          ? { boxShadow: "0 0 26px rgba(249, 115, 22, 0.16)" }
          : undefined
      }
    >
      {/* Stort tal med flamme */}
      <div className="flex items-center gap-4">
        <span
          className="text-4xl"
          style={{ filter: "drop-shadow(0 0 10px rgba(249, 115, 22, 0.6))" }}
        >
          🔥
        </span>
        <div className="flex items-baseline gap-2">
          <span
            className="text-5xl font-extrabold text-orange-400"
            style={{ textShadow: "0 0 18px rgba(251, 146, 60, 0.5)" }}
          >
            {streak}
          </span>
          <span className="text-sm text-slate-400">
            {streak === 1 ? "dag i træk" : "dage i træk"}
          </span>
        </div>

        {/* Personlig rekord ude i højre side - kan aldrig mistes. */}
        {rekord > 0 && (
          <span className="ml-auto text-right text-xs text-slate-500">
            Rekord
            <br />
            <span className="text-sm font-semibold text-slate-300">
              {rekord} {rekord === 1 ? "dag" : "dage"}
            </span>
          </span>
        )}
      </div>

      {/* "Du er tæt på"-linje. */}
      <p
        className={
          "text-sm font-medium " +
          (groenIDag ? "text-emerald-300" : "text-amber-300")
        }
      >
        🎯 {naesteMaal}
      </p>

      {/* Besked når skjoldet har reddet en misset dag. */}
      {skjoldBrugt && (
        <p className="rounded-lg bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400">
          🛡️ Streaken overlevede én misset dag. Misser du én til, nulstilles den.
        </p>
      )}

      {/* Uge-sporet: mandag til søndag. */}
      <div className="flex justify-between gap-1">
        {ugensDage.map((dag) => (
          <div
            key={dag.dato}
            className={
              "flex flex-col items-center gap-1 " +
              (dag.erFremtid ? "opacity-40" : "")
            }
          >
            <span
              className={
                "text-xs " +
                (dag.erIDag
                  ? "font-semibold text-emerald-400"
                  : "text-slate-500")
              }
            >
              {dag.label}
            </span>
            <span
              className={
                "flex h-8 w-8 items-center justify-center rounded-full text-base " +
                (dag.groen ? "bg-orange-500/15 " : "bg-slate-900 ") +
                (dag.erIDag ? "ring-2 ring-emerald-400" : "")
              }
            >
              {dag.groen ? "🔥" : <span className="text-slate-600">–</span>}
            </span>
          </div>
        ))}
      </div>

      {/* Dagens status + tandhjul til indstillingen. */}
      <div className="flex items-center justify-between text-sm">
        <span className={groenIDag ? "text-emerald-400" : "text-slate-400"}>
          {groenIDag ? "I dag er grøn ✓" : `I dag ${gjortIDag}/${taerskel}`}
        </span>
        <button
          type="button"
          onClick={() => setVisIndstilling((v) => !v)}
          aria-label="Indstil hvornår en dag er grøn"
          className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
        >
          ⚙
        </button>
      </div>

      {/* Selve indstillingen - kun synlig når tandhjulet er klikket. */}
      {visIndstilling && (
        <label className="flex items-center gap-2 border-t border-slate-700 pt-3 text-sm text-slate-400">
          Grøn dag = mindst
          <input
            type="number"
            min={1}
            max={antalVaner}
            value={taerskel}
            onChange={(e) => onTaerskel(Number(e.target.value) || 1)}
            className="w-16 rounded-lg border border-slate-600 bg-slate-900 px-2 py-1 text-slate-100"
          />
          af {antalVaner} vaner
        </label>
      )}
    </div>
  );
}
