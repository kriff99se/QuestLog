type Props = {
  streak: number; // samlet dags-streak (grønne dage i træk)
  taerskel: number; // hvor mange vaner der skal til for en grøn dag
  antalVaner: number; // hvor mange vaner der findes i alt
  gjortIDag: number; // hvor mange vaner der er klaret i dag
  onTaerskel: (ny: number) => void; // kaldes når brugeren ændrer tærsklen
};

// Kortet der viser den samlede streak og lader dig ændre tærsklen for,
// hvornår en dag er "grøn".
export function StreakBanner({
  streak,
  taerskel,
  antalVaner,
  gjortIDag,
  onTaerskel,
}: Props) {
  const groenIDag = gjortIDag >= taerskel;
  const mangler = taerskel - gjortIDag; // hvor mange flere til en grøn dag

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-800 p-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🔥</span>
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-emerald-400">
            {streak === 0
              ? "Ingen streak endnu"
              : `${streak} ${streak === 1 ? "dag" : "dage"} i træk`}
          </span>
          <span className="text-sm text-slate-400">
            {groenIDag
              ? "I dag er grøn ✓"
              : `${mangler} ${mangler === 1 ? "vane" : "vaner"} til en grøn dag`}
          </span>
        </div>
      </div>

      {/* Indstilling: hvor mange vaner en grøn dag kræver. */}
      <label className="flex items-center gap-2 text-sm text-slate-400">
        Grøn dag = mindst
        <input
          type="number"
          min={1}
          max={antalVaner}
          value={taerskel}
          onChange={(e) => onTaerskel(Number(e.target.value) || 1)}
          className="w-16 rounded-lg border border-slate-600 bg-slate-900 px-2 py-1 text-slate-100"
        />
        af {antalVaner} vaner
      </label>
    </div>
  );
}
