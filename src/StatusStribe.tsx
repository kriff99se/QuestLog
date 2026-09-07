import type { Titel } from "./titler";

type Props = {
  titel: Titel; // nuværende level-titel (vi bruger emojien)
  level: number;
  streak: number; // samlet dags-streak
  gjortIDag: number; // hvor mange vaner er klaret i dag
  taerskel: number; // hvor mange der skal til for en grøn dag
  naesteMaal: string; // "Kun 2 vaner til en grøn dag" / "3 dage til ..."
};

// En kompakt status-stribe, der klæber fast øverst på "Hjem"-skærmen.
// Den samler det vigtigste på tre linjer: level + streak, dagens fremskridt,
// og hvad man er tæt på. Så kan man se sin status uden at scrolle.
export function StatusStribe({
  titel,
  level,
  streak,
  gjortIDag,
  taerskel,
  naesteMaal,
}: Props) {
  const groenIDag = gjortIDag >= taerskel;
  const procent = Math.min(100, (gjortIDag / taerskel) * 100);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-700 bg-slate-800 p-3 shadow-md shadow-slate-950/40">
      {/* Linje 1: titel + level til venstre, streak til højre. */}
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          {/* Billede hvis titlen har et, ellers emojien. */}
          {titel.billede ? (
            <img
              src={titel.billede}
              alt=""
              className="h-7 w-7 flex-none rounded-md object-cover"
            />
          ) : (
            <span className="flex-none text-xl">{titel.emoji}</span>
          )}
          <span className="truncate font-semibold text-emerald-400">
            {titel.navn}
          </span>
          <span className="flex-none text-xs text-slate-500">Lvl {level}</span>
        </span>
        <span className="flex flex-none items-center gap-1 font-semibold text-orange-400">
          🔥 {streak}
        </span>
      </div>

      {/* Linje 2: dagens fremskridt mod en grøn dag. */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className={
            "h-full rounded-full transition-all " +
            (groenIDag ? "bg-emerald-500" : "bg-amber-400")
          }
          style={{ width: `${procent}%` }}
        />
      </div>

      {/* Linje 3: hvad man er tæt på. */}
      <p
        className={
          "text-sm font-medium " +
          (groenIDag ? "text-emerald-300" : "text-amber-300")
        }
      >
        {groenIDag && <span className="text-emerald-400">✓ Grøn dag · </span>}
        🎯 {naesteMaal}
      </p>
    </div>
  );
}
