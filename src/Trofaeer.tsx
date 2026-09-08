import {
  TROFAEER,
  opnaaedeTrofaeer,
  trofaeScore,
  type Trofae,
  type TrofaeData,
} from "./achievements";

type Props = {
  data: TrofaeData;
};

// Tekstfarve pr. tier - så man kan se sværhedsgraden på et blik.
const TIER_FARVE: Record<Trofae["tier"], string> = {
  bronze: "text-amber-600",
  sølv: "text-slate-300",
  guld: "text-yellow-400",
  platin: "text-sky-400",
  legendarisk: "text-fuchsia-400",
};

// Trofæ-skærmen: en liste over alle trofæer, delt i "opnået" og "mangler".
export function Trofaeer({ data }: Props) {
  const opnaaede = opnaaedeTrofaeer(data);
  const opnaaedeIder = new Set(opnaaede.map((t) => t.id));
  const score = trofaeScore(data);

  const mangler = TROFAEER.filter((t) => !opnaaedeIder.has(t.id));
  const procent = Math.round((opnaaede.length / TROFAEER.length) * 100);

  return (
    <div className="flex flex-col gap-4">
      {/* Overskrift + samlet trofæ-score. */}
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-semibold text-emerald-400">
            {opnaaede.length} / {TROFAEER.length} trofæer
          </span>
          <span className="text-sm text-slate-400">
            {score.toLocaleString("da-DK")} trofæ-point
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${procent}%` }}
          />
        </div>
      </div>

      {/* Opnåede trofæer. */}
      {opnaaede.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-slate-300">
            Opnået ({opnaaede.length})
          </h2>
          <ul className="flex flex-col gap-2">
            {opnaaede.map((t) => (
              <TrofaeRaekke key={t.id} trofae={t} opnaaet />
            ))}
          </ul>
        </div>
      )}

      {/* Trofæer der mangler. */}
      {mangler.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-slate-300">
            Mangler ({mangler.length})
          </h2>
          <ul className="flex flex-col gap-2">
            {mangler.map((t) => (
              <TrofaeRaekke key={t.id} trofae={t} opnaaet={false} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Én række i listen.
function TrofaeRaekke({
  trofae,
  opnaaet,
}: {
  trofae: Trofae;
  opnaaet: boolean;
}) {
  return (
    <li
      className={
        "flex items-center gap-3 rounded-xl border p-3 " +
        (opnaaet
          ? "border-slate-700 bg-slate-800"
          : "border-slate-800 bg-slate-800/40 opacity-55")
      }
    >
      <span className="flex-none text-2xl">{trofae.ikon}</span>

      <span className="min-w-0 flex-1">
        <span className="block font-medium break-words">
          {trofae.navn}
          {opnaaet && <span className="text-emerald-400"> ✓</span>}
        </span>
        <span className="block text-xs text-slate-400 break-words">
          {trofae.beskrivelse}
        </span>
      </span>

      <span className={"flex-none text-right text-xs " + TIER_FARVE[trofae.tier]}>
        <span className="block font-semibold">+{trofae.vaerdi}</span>
        <span className="block capitalize">{trofae.tier}</span>
      </span>
    </li>
  );
}
