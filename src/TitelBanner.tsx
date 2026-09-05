import type { Titel } from "./titler";

type Props = {
  titel: Titel;
  level: number;
};

// Banneret øverst der viser din nuværende titel og et billede
// (eller emojien, hvis der ikke er lagt et billede ind).
export function TitelBanner({ titel, level }: Props) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-800 p-4">
      {/* Billede hvis titlen har et, ellers den store emoji. */}
      {titel.billede ? (
        <img
          src={titel.billede}
          alt={titel.navn}
          className="h-16 w-16 rounded-lg object-cover"
        />
      ) : (
        <span className="text-5xl">{titel.emoji}</span>
      )}

      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wide text-slate-500">
          Din titel
        </span>
        <span className="text-xl font-bold text-emerald-400">{titel.navn}</span>
        <span className="text-sm text-slate-400">Level {level}</span>
      </div>
    </div>
  );
}
