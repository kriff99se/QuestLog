import type { ReactNode } from "react";

type Props = {
  forskydning: number; // hvor mange dage vi er væk fra den rigtige dag
  onSkift: (nyForskydning: number) => void;
};

// Et lille testværktøj. Det lader os lade som om det er en anden dag,
// så vi kan afprøve streaks uden at vente i flere døgn.
// Det ændrer IKKE rigtige data - kun hvilken dato appen viser og krydser af.
export function DatoHjaelper({ forskydning, onSkift }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-slate-700 p-3 text-sm text-slate-400">
      <span>🛠️ Testværktøj: dagens dato</span>
      <div className="flex items-center gap-1">
        <Knap onClick={() => onSkift(forskydning - 1)}>◀ dag</Knap>
        <Knap onClick={() => onSkift(0)}>I dag</Knap>
        <Knap onClick={() => onSkift(forskydning + 1)}>dag ▶</Knap>
      </div>
    </div>
  );
}

// Lille knap, kun brugt her i filen.
function Knap({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700"
    >
      {children}
    </button>
  );
}
