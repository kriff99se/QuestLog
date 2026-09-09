import type { Titel } from "./titler";
import { naesteUgeMaal } from "./streaks";

type Props = {
  titel: Titel; // nuværende level-titel (navn + emoji/billede)
  level: number;
  samledePoint: number; // point i alt
  pointTilNaeste: number; // point der mangler til næste level
  ugeStreak: number; // uger i træk uge-målet er nået
  denneUgesPoint: number; // point tjent i denne uge indtil nu
  ugeMaal: number; // mål for point på en uge
};

// En kompakt status-stribe, der klæber fast øverst på "Hjem"-skærmen.
// Den samler det vigtigste: titel + level + uge-streak, point-status,
// og hvor langt man er mod ugens mål. Alt uden at scrolle.
export function StatusStribe({
  titel,
  level,
  samledePoint,
  pointTilNaeste,
  ugeStreak,
  denneUgesPoint,
  ugeMaal,
}: Props) {
  const maalNaaet = ugeMaal > 0 && denneUgesPoint >= ugeMaal;
  const procent =
    ugeMaal > 0 ? Math.min(100, (denneUgesPoint / ugeMaal) * 100) : 0;
  // "Du er tæt på"-tekst: point til målet, eller uger til næste stime-milepæl.
  const maalTekst = naesteUgeMaal(denneUgesPoint, ugeMaal, ugeStreak);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-700 bg-slate-800 p-3 shadow-md shadow-slate-950/40">
      {/* Linje 1: titel + level til venstre, uge-streak til højre. */}
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
        {/* Uge-streak: uger i træk uge-målet er nået. */}
        <span className="flex flex-none items-center gap-1 font-semibold text-orange-400">
          🔥 {ugeStreak}
          <span className="text-xs font-normal text-slate-500">
            {ugeStreak === 1 ? "uge" : "uger"}
          </span>
        </span>
      </div>

      {/* Linje 2: point i alt + hvad der mangler til næste level. */}
      <p className="text-xs text-slate-500">
        {samledePoint.toLocaleString("da-DK")} point ·{" "}
        {pointTilNaeste.toLocaleString("da-DK")} til Level {level + 1}
      </p>

      {/* Linje 3: ugens fremskridt mod uge-målet. */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className={
            "h-full rounded-full transition-all " +
            (maalNaaet ? "bg-emerald-500" : "bg-amber-400")
          }
          style={{ width: `${procent}%` }}
        />
      </div>

      {/* Linje 4: hvor langt man er fra ugens mål. */}
      <p
        className={
          "text-sm font-medium " +
          (maalNaaet ? "text-emerald-300" : "text-amber-300")
        }
      >
        {maalNaaet && (
          <span className="text-emerald-400">✓ Uge-målet er nået · </span>
        )}
        🎯 {maalTekst}
      </p>
    </div>
  );
}
