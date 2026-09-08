import { useState } from "react";

// Én dag i uge-sporet.
export type UgeDag = {
  dato: string; // "2026-09-05"
  label: string; // "ma", "ti" ...
  groen: boolean; // var dagen grøn (nåede tærsklen)?
  erIDag: boolean; // er det den dag appen viser lige nu?
  erFremtid: boolean; // ligger dagen senere end i dag?
};

type Props = {
  streak: number; // samlet dags-streak (kun brugt til den varme glød)
  skjoldBrugt: boolean; // reddede streaken en misset dag?
  rekord: number; // den længste streak nogensinde
  taerskel: number; // hvor mange vaner der skal til for en grøn dag
  antalVaner: number; // hvor mange DAGLIGE vaner der findes (uge-vaner tæller ikke med)
  ugensDage: UgeDag[]; // mandag..søndag i den viste uge
  onTaerskel: (ny: number) => void; // kaldes når brugeren ændrer tærsklen
};

// "Denne uge"-kortet: uge-sporet med flammer, den personlige rekord,
// og tærskel-indstillingen gemt bag et lille tandhjul. Selve streak-tallet
// og dagens fremskridt står i status-stribjen øverst på skærmen.
export function StreakBanner({
  streak,
  skjoldBrugt,
  rekord,
  taerskel,
  antalVaner,
  ugensDage,
  onTaerskel,
}: Props) {
  // Er tærskel-indstillingen foldet ud? Starter skjult.
  const [visIndstilling, setVisIndstilling] = useState(false);

  const harStreak = streak > 0;

  return (
    <div
      className={
        "flex flex-col gap-3 rounded-2xl border bg-slate-800 p-4 sm:p-5 " +
        (harStreak ? "border-orange-500/40" : "border-slate-700")
      }
      // Blød varm glød om kortet, når man har en streak i gang.
      style={
        harStreak
          ? { boxShadow: "0 0 26px rgba(249, 115, 22, 0.16)" }
          : undefined
      }
    >
      {/* Overskrift + personlig rekord. */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300">Denne uge</h2>
        {rekord > 0 && (
          <span className="text-xs text-slate-500">
            Rekord:{" "}
            <span className="font-semibold text-slate-300">
              {rekord} {rekord === 1 ? "dag" : "dage"}
            </span>
          </span>
        )}
      </div>

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

      {/* Besked når skjoldet har reddet en misset dag. */}
      {skjoldBrugt && (
        <p className="rounded-lg bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400">
          🛡️ Streaken overlevede én misset dag. Misser du én til, nulstilles den.
        </p>
      )}

      {/* Tandhjul til tærskel-indstillingen. */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Grøn dag = mindst {taerskel} daglige vaner</span>
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
          af {antalVaner} daglige vaner
        </label>
      )}
    </div>
  );
}
