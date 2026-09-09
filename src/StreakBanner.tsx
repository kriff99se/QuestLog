import { useState } from "react";

// Én dag i uge-sporet.
export type UgeDag = {
  dato: string; // "2026-09-05"
  label: string; // "ma", "ti" ...
  groen: boolean; // tjente man mindst dagsMaal point den dag?
  erIDag: boolean; // er det den dag appen viser lige nu?
  erFremtid: boolean; // ligger dagen senere end i dag?
};

type Props = {
  streak: number; // uge-mål-streak (uger i træk) - kun brugt til den varme glød
  rekord: number; // den længste uge-mål-streak nogensinde
  dagsMaal: number; // point på en dag for at den vises grøn i uge-sporet
  ugensDage: UgeDag[]; // mandag..søndag i den viste uge
  ugeMaal: number; // mål for point tjent på en uge
  denneUgesPoint: number; // point tjent i denne uge indtil nu
  onUgeMaal: (ny: number) => void; // kaldes når brugeren ændrer uge-målet
};

// "Denne uge"-kortet: uge-målet i point (streaken), uge-sporet med flammer
// (hvilke dage man tjente mindst dagsMaal point), og rekorden.
export function StreakBanner({
  streak,
  rekord,
  dagsMaal,
  ugensDage,
  ugeMaal,
  denneUgesPoint,
  onUgeMaal,
}: Props) {
  // Er uge-mål-indstillingen foldet ud? Starter skjult.
  const [visUgeMaal, setVisUgeMaal] = useState(false);

  const harStreak = streak > 0;

  // Hvor langt er vi mod uge-målet? (0-100 %, aldrig over 100 på bjælken.)
  const ugeMaalNaaet = ugeMaal > 0 && denneUgesPoint >= ugeMaal;
  const ugeProcent =
    ugeMaal > 0 ? Math.min(100, (denneUgesPoint / ugeMaal) * 100) : 0;
  const ugeMangler = Math.max(0, ugeMaal - denneUgesPoint);

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
              {rekord} {rekord === 1 ? "uge" : "uger"}
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

      {/* Lille forklaring på flammerne - de påvirker ikke streaken. */}
      <p className="text-xs text-slate-500">
        🔥 = dag hvor du tjente mindst {dagsMaal} point
      </p>

      {/* Uge-mål i point: hvor mange point man vil tjene på ugen.
          En produktiv dag fylder en stor bid, så en stille dag bagefter
          ikke koster noget. */}
      <div className="flex flex-col gap-1.5 border-t border-slate-700 pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">
            <span className="font-semibold text-slate-200">
              {denneUgesPoint}
            </span>{" "}
            / {ugeMaal} point denne uge
          </span>
          <button
            type="button"
            onClick={() => setVisUgeMaal((v) => !v)}
            aria-label="Indstil uge-målet"
            className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          >
            ⚙
          </button>
        </div>

        {/* Selve bjælken mod uge-målet. */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
          <div
            className={
              "h-full rounded-full transition-all " +
              (ugeMaalNaaet ? "bg-emerald-500" : "bg-amber-400")
            }
            style={{ width: `${ugeProcent}%` }}
          />
        </div>

        {ugeMaalNaaet ? (
          <p className="text-xs font-medium text-emerald-300">
            ✓ Uge-målet er nået
          </p>
        ) : (
          <p className="text-xs text-slate-500">
            {ugeMangler} point tilbage
          </p>
        )}

        {/* Selve indstillingen - kun synlig når tandhjulet er klikket. */}
        {visUgeMaal && (
          <label className="mt-1 flex items-center gap-2 border-t border-slate-700 pt-3 text-sm text-slate-400">
            Uge-mål
            <input
              type="number"
              min={0}
              step={25}
              value={ugeMaal}
              onChange={(e) => onUgeMaal(Number(e.target.value) || 0)}
              className="w-20 rounded-lg border border-slate-600 bg-slate-900 px-2 py-1 text-slate-100"
            />
            point
          </label>
        )}
      </div>
    </div>
  );
}
