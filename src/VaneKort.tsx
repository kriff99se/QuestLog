import { useState } from "react";
import type { Vane } from "./types";

// Props er de oplysninger, App sender ned til hvert kort.
type Props = {
  vane: Vane;
  gjort: boolean; // er vanen krydset af i dag?
  streak: number; // dage i træk denne vane er holdt (0 = ingen)
  onSkift: () => void; // kaldes når brugeren klikker på kortet
};

// Ét vane-kort i listen. Et klik hvor som helst på kortet
// skifter mellem "gjort" og "ikke gjort".
export function VaneKort({ vane, gjort, streak, onSkift }: Props) {
  // Streak-pillen bliver varmere, jo længere streaken er:
  // gul under 7 dage, orange fra 7, rød med glød fra 30.
  const pilleFarve =
    streak >= 30
      ? "bg-red-500/20 text-red-300"
      : streak >= 7
        ? "bg-orange-500/20 text-orange-300"
        : "bg-amber-500/15 text-amber-300";

  // Ekstra glød om pillen ved lange streaks (30+ dage).
  const pilleGlow =
    streak >= 30 ? { boxShadow: "0 0 12px rgba(239, 68, 68, 0.45)" } : undefined;

  // Styrer det lille "pop" på fluebens-cirklen. Ved hvert klik tænder vi
  // det kort og slukker det igen efter 300 ms (lige så længe animationen
  // varer). En timer er nemmere at styre end at vente på "animation slut".
  const [popper, setPopper] = useState(false);

  function haandterKlik() {
    onSkift();
    setPopper(true);
    setTimeout(() => setPopper(false), 300);
  }

  return (
    <li>
      <button
        type="button"
        onClick={haandterKlik}
        // "active:scale-[0.98]" får kortet til at dykke en anelse, mens
        // man holder museknappen nede - en lille "tryk"-fornemmelse.
        className={
          "w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-transform active:scale-[0.98] " +
          // Grøn kant og baggrund hvis vanen er klaret, ellers neutral grå.
          (gjort
            ? "border-emerald-500 bg-emerald-500/10"
            : "border-slate-700 bg-slate-800 hover:border-slate-600")
        }
      >
        <span className="flex-none text-2xl">{vane.ikon}</span>

        {/* "min-w-0" lader dette felt skrumpe, så lange vane-navne bryder
            om i stedet for at skubbe kortet ud over skærmkanten. */}
        <span className="min-w-0 flex-1">
          <span className="block font-medium break-words">{vane.navn}</span>
          <span className="block text-sm text-slate-400">{vane.point} point</span>
        </span>

        {/* Streak-pille: kun vist hvis vanen er holdt mindst én dag i træk. */}
        {streak > 0 && (
          <span
            className={
              "flex flex-none items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold " +
              pilleFarve
            }
            style={pilleGlow}
          >
            🔥 {streak}
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
    </li>
  );
}
