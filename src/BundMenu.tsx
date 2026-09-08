// Bund-menuen: en fast linje i bunden af skærmen med de fire skærme,
// ligesom i en rigtig iPhone-app. Ikonerne er små tegninger (SVG), så
// menuen ser "app-agtig" ud og ikke som en række knapper på en hjemmeside.

export type Visning =
  | "i-dag"
  | "todo"
  | "historik"
  | "trofaeer"
  | "rediger";

type Props = {
  visning: Visning;
  onVaelg: (v: Visning) => void;
};

// Ét lille streg-ikon. "d" er selve tegningen (en SVG-sti).
function Ikon({ d }: { d: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const FANER: { id: Visning; navn: string; d: string }[] = [
  { id: "i-dag", navn: "Hjem", d: "M3 10.5 12 3l9 7.5M5 9v11h14V9" },
  {
    id: "todo",
    navn: "To-do",
    d: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",
  },
  {
    id: "historik",
    navn: "Historik",
    d: "M4 5h16v15H4zM4 10h16M9 3v4M15 3v4",
  },
  {
    id: "trofaeer",
    navn: "Trofæer",
    d: "M8 21h8M12 17v4M6 4h12v4a6 6 0 0 1-12 0zM6 5H3v2a3 3 0 0 0 3 3M18 5h3v2a3 3 0 0 1-3 3",
  },
  { id: "rediger", navn: "Rediger", d: "m4 20 1-4L16 5l3 3L8 19l-4 1zM14 7l3 3" },
];

export function BundMenu({ visning, onVaelg }: Props) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-900/95 backdrop-blur"
      // Ekstra plads i bunden til iPhone'ens "home"-streg.
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-md">
        {FANER.map((fane) => {
          const aktiv = visning === fane.id;
          return (
            <button
              key={fane.id}
              type="button"
              onClick={() => onVaelg(fane.id)}
              className={
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] transition-colors " +
                (aktiv ? "text-emerald-400" : "text-slate-500 hover:text-slate-300")
              }
            >
              <Ikon d={fane.d} />
              {fane.navn}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
