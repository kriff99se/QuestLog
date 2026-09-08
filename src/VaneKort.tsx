import { useState } from "react";
import type { Vane } from "./types";

// Props er de oplysninger, App sender ned til hvert kort.
type Props = {
  vane: Vane;
  gjort: boolean; // er vanen krydset af i dag?
  streak: number; // dage i træk denne vane er holdt (0 = ingen)
  dageGjortIAlt: number; // hvor mange dage i alt vanen er krydset af
  gjortIUge: number; // gange gjort i denne uge (kun brugt til uge-vaner)
  ugeStreak: number; // uger i træk målet er ramt (kun brugt til uge-vaner)
  onSkift: () => void; // kaldes når brugeren klikker på kortet
};

// Ét vane-kort i listen. Et klik på selve rækken skifter mellem
// "gjort" og "ikke gjort". Har vanen en besparelse pr. dag (fx "Ingen
// snus"), er der desuden en lille 💰-knap nederst på kortet.
export function VaneKort({
  vane,
  gjort,
  streak,
  dageGjortIAlt,
  gjortIUge,
  ugeStreak,
  onSkift,
}: Props) {
  // Er det en uge-vane (fx "4 gange om ugen")? Så viser kortet uge-fremskridt
  // i stedet for en dags-streak.
  const maalPrUge = vane.maalPrUge ?? 0;
  const erUgeVane = maalPrUge > 0;
  const ugeMaalNaaet = erUgeVane && gjortIUge >= maalPrUge;

  // Til pillen øverst til højre bruger vi enten dags-streaken eller
  // uge-streaken, alt efter hvilken slags vane det er.
  const streakTal = erUgeVane ? ugeStreak : streak;

  // Pillen bliver varmere, jo længere streaken er:
  // gul under 7, orange fra 7, rød med glød fra 30.
  const pilleFarve =
    streakTal >= 30
      ? "bg-red-500/20 text-red-300"
      : streakTal >= 7
        ? "bg-orange-500/20 text-orange-300"
        : "bg-amber-500/15 text-amber-300";

  // Ekstra glød om pillen ved lange streaks (30+).
  const pilleGlow =
    streakTal >= 30
      ? { boxShadow: "0 0 12px rgba(239, 68, 68, 0.45)" }
      : undefined;

  // Styrer det lille "pop" på fluebens-cirklen. Ved hvert klik tænder vi
  // det kort og slukker det igen efter 300 ms (lige så længe animationen
  // varer). En timer er nemmere at styre end at vente på "animation slut".
  const [popper, setPopper] = useState(false);

  // Er penge-linjen foldet ud? Starter skjult.
  const [visPenge, setVisPenge] = useState(false);

  function haandterKlik() {
    onSkift();
    setPopper(true);
    setTimeout(() => setPopper(false), 300);
  }

  // Kroner sparet i alt = beløb pr. dag × antal dage vanen er holdt.
  const sparerPrDag = vane.sparerPrDag ?? 0;
  const sparetIAlt = sparerPrDag * dageGjortIAlt;

  return (
    <li
      className={
        // Kortets ramme og farve ligger på <li>, så penge-linjen kan ligge
        // i det samme kort som selve afkrydsningen. "overflow-hidden" holder
        // skillelinjen inden for de runde hjørner.
        //
        // Klarede vaner tones NED (opacity), så de lyse kort, der er tilbage,
        // er dem, øjet fanger - man kan se "hvad mangler jeg" på et blik.
        "overflow-hidden rounded-xl border transition-opacity " +
        (gjort
          ? "border-slate-800 bg-slate-800/50 opacity-55"
          : "border-slate-700 bg-slate-800")
      }
    >
      {/* Selve afkrydsningen: klik hvor som helst på rækken. */}
      <button
        type="button"
        onClick={haandterKlik}
        className="flex w-full items-center gap-3 p-4 text-left transition-transform active:scale-[0.98]"
      >
        <span className="flex-none text-2xl">{vane.ikon}</span>

        {/* "min-w-0" lader dette felt skrumpe, så lange vane-navne bryder
            om i stedet for at skubbe kortet ud over skærmkanten. */}
        <span className="min-w-0 flex-1">
          <span className="block font-medium break-words">{vane.navn}</span>
          <span className="block text-sm text-slate-400">{vane.point} point</span>

          {/* Kun for uge-vaner: en lille fremskridts-linje for ugen -
              prikker der fyldes + tekst ("3 / 4 i denne uge"). */}
          {erUgeVane && (
            <span className="mt-1 flex items-center gap-2">
              {/* Én prik pr. gang, målet kræver. Fyldt = allerede gjort. */}
              <span className="flex gap-1">
                {Array.from({ length: maalPrUge }).map((_, i) => (
                  <span
                    key={i}
                    className={
                      "h-2 w-2 rounded-full " +
                      (i < gjortIUge
                        ? ugeMaalNaaet
                          ? "bg-emerald-400"
                          : "bg-amber-400"
                        : "bg-slate-600")
                    }
                  />
                ))}
              </span>
              <span
                className={
                  "text-xs font-medium " +
                  (ugeMaalNaaet ? "text-emerald-300" : "text-slate-400")
                }
              >
                {ugeMaalNaaet
                  ? "✓ Klaret i denne uge"
                  : `${gjortIUge} / ${maalPrUge} i denne uge`}
              </span>
            </span>
          )}
        </span>

        {/* Streak-pille. For daglige vaner: dage i træk. For uge-vaner:
            uger i træk målet er ramt. Kun vist hvis tallet er mindst 1. */}
        {streakTal > 0 && (
          <span
            className={
              "flex flex-none items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold " +
              pilleFarve
            }
            style={pilleGlow}
          >
            🔥 {streakTal}
            {erUgeVane && (streakTal === 1 ? " uge" : " uger")}
          </span>
        )}

        {/* Lille cirkel til højre der viser status: flueben hvis klaret.
            "animer-pop" spiller en kort skala-animation ved hvert klik. */}
        <span
          className={
            "flex h-6 w-6 flex-none items-center justify-center rounded-full border text-sm " +
            (popper ? "animer-pop " : "") +
            (gjort
              ? "border-emerald-500 bg-emerald-500 text-slate-900"
              : "border-slate-600 text-transparent")
          }
        >
          ✓
        </span>
      </button>

      {/* Penge-linje: kun hvis vanen har en besparelse pr. dag. */}
      {sparerPrDag > 0 && (
        <div className="border-t border-slate-700/60 px-4 py-2 text-sm">
          <button
            type="button"
            onClick={() => setVisPenge((v) => !v)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200"
          >
            <span>💰</span>
            <span>
              {visPenge ? "Skjul besparelse" : "Se hvad du har sparet"}
            </span>
          </button>

          {visPenge && (
            <p className="mt-1 text-emerald-300">
              Du har sparet{" "}
              <span className="font-semibold">
                {sparetIAlt.toLocaleString("da-DK")} kr
              </span>{" "}
              &mdash; {dageGjortIAlt} {dageGjortIAlt === 1 ? "dag" : "dage"} ×{" "}
              {sparerPrDag} kr.
            </p>
          )}
        </div>
      )}
    </li>
  );
}
