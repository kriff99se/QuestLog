import type { Trofae } from "./achievements";

type Props = {
  trofae: Trofae | null; // trofæet der fejres, eller null = vis ingenting
  onLuk: () => void;
};

// En kort fejring midt på skærmen, når et nyt trofæ låses op.
// App styrer, hvornår den vises, og lukker den selv igen efter et par sekunder.
export function TrofaeFejring({ trofae, onLuk }: Props) {
  if (trofae === null) return null;

  return (
    <div
      className="animer-ton-ind fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6"
      onClick={onLuk}
    >
      <div className="animer-fejring flex max-w-xs flex-col items-center gap-2 rounded-2xl border border-emerald-500 bg-slate-800 px-8 py-7 text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Nyt trofæ
        </span>
        <span className="text-6xl">{trofae.ikon}</span>
        <span className="text-xl font-bold text-emerald-400">{trofae.navn}</span>
        <span className="text-sm text-slate-400">{trofae.beskrivelse}</span>
        <span className="mt-1 text-sm font-semibold text-emerald-300">
          +{trofae.vaerdi} trofæ-point
        </span>
      </div>
    </div>
  );
}
