type Props = {
  level: number | null; // level'et vi fejrer, eller null = vis ingenting
  onLuk: () => void; // kaldes når man klikker for at lukke fejringen
};

// En kort fejring midt på skærmen, når man går et level op.
// App styrer, hvornår den vises, og lukker den selv igen efter et par sekunder
// (eller når man klikker på den).
export function Fejring({ level, onLuk }: Props) {
  // Er der ikke noget at fejre, tegner vi ingenting.
  if (level === null) return null;

  return (
    <div
      // Et halvgennemsigtigt mørkt lag hen over hele skærmen. "animer-ton-ind"
      // får laget til at tone blødt frem (se index.css).
      className="animer-ton-ind fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6"
      onClick={onLuk}
    >
      <div className="animer-fejring rounded-2xl border border-emerald-500 bg-slate-800 px-10 py-8 text-center">
        <div className="text-6xl">🎉</div>
        <div className="mt-3 text-2xl font-bold text-emerald-400">
          Level {level}!
        </div>
        <div className="text-sm text-slate-400">Godt gået</div>
      </div>
    </div>
  );
}
