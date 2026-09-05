import type { LevelInfo } from "./point";

// Props: de færdigberegnede tal, som App sender ned.
type Props = {
  samledePoint: number;
  levelInfo: LevelInfo;
};

// Kortet i toppen der viser samlede point, nuværende level
// og en fremskridtsbjælke mod næste level.
export function PointOversigt({ samledePoint, levelInfo }: Props) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-700 bg-slate-800 p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-lg font-semibold text-emerald-400">
          Level {levelInfo.level}
        </span>
        <span className="text-sm text-slate-400">{samledePoint} point i alt</span>
      </div>

      {/* Fremskridtsbjælken: en grå "skinne" med en grøn "fyldning".
          Fyldningens bredde styres af procenten (0-100). */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${levelInfo.procent}%` }}
        />
      </div>

      <p className="text-xs text-slate-500">
        {levelInfo.pointIDetteLevel} / {levelInfo.prisForDetteLevel} point &mdash;{" "}
        {levelInfo.pointTilNaeste} til level {levelInfo.level + 1}
      </p>
    </div>
  );
}
