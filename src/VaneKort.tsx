import type { Vane } from "./types";

// Props er de oplysninger, App sender ned til hvert kort.
type Props = {
  vane: Vane;
  gjort: boolean; // er vanen krydset af i dag?
  onSkift: () => void; // kaldes når brugeren klikker på kortet
};

// Ét vane-kort i listen. Et klik hvor som helst på kortet
// skifter mellem "gjort" og "ikke gjort".
export function VaneKort({ vane, gjort, onSkift }: Props) {
  return (
    <li>
      <button
        type="button"
        onClick={onSkift}
        className={
          "w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-colors " +
          // Grøn kant og baggrund hvis vanen er klaret, ellers neutral grå.
          (gjort
            ? "border-emerald-500 bg-emerald-500/10"
            : "border-slate-700 bg-slate-800 hover:border-slate-600")
        }
      >
        <span className="text-2xl">{vane.ikon}</span>

        <span className="flex-1">
          <span className="block font-medium">{vane.navn}</span>
          <span className="block text-sm text-slate-400">{vane.point} point</span>
        </span>

        {/* Lille cirkel til højre der viser status: flueben hvis klaret. */}
        <span
          className={
            "flex h-6 w-6 items-center justify-center rounded-full border text-sm " +
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
