import type { Vane } from "./types";

type Props = {
  vaner: Vane[];
  // setVaner virker som "sæt-funktionen" fra useState: vi giver den enten
  // en ny liste, eller en funktion der laver den nye liste ud fra den gamle.
  setVaner: (nye: Vane[] | ((gamle: Vane[]) => Vane[])) => void;
};

// Skærmen hvor man kan tilføje, omdøbe, skifte ikon/point og slette vaner.
// Alle ændringer sendes op til App via setVaner, som gemmer dem i localStorage.
export function RedigerVaner({ vaner, setVaner }: Props) {
  // Ret ét felt på én vane. "aendringer" er fx { navn: "Ny tekst" }
  // eller { point: 20 }. Resten af vanen beholdes som den var.
  function opdaterVane(id: string, aendringer: Partial<Vane>) {
    setVaner((gamle) =>
      gamle.map((vane) =>
        vane.id === id ? { ...vane, ...aendringer } : vane,
      ),
    );
  }

  // Fjern en vane fra listen. Gamle afkrydsninger for vanen bliver liggende,
  // men de tælles ikke med længere (de hører ikke til nogen vane mere).
  function sletVane(id: string) {
    // window.confirm viser en lille "er du sikker?"-boks.
    const vane = vaner.find((v) => v.id === id);
    if (!window.confirm(`Slet vanen "${vane?.navn}"?`)) return;

    setVaner((gamle) => gamle.filter((vane) => vane.id !== id));
  }

  // Læg en ny, tom vane nederst. Den får et id ud fra tidspunktet lige nu,
  // så to nye vaner aldrig kan få samme id.
  function tilfoejVane() {
    const nyVane: Vane = {
      id: "vane-" + Date.now(),
      navn: "Ny vane",
      ikon: "✨",
      point: 5,
    };
    setVaner((gamle) => [...gamle, nyVane]);
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {vaner.map((vane) => (
          <li
            key={vane.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-800 p-4"
          >
            <div className="flex gap-2">
              {/* Ikon-feltet. Her skriver man en emoji. */}
              <input
                aria-label="Ikon"
                value={vane.ikon}
                onChange={(e) => opdaterVane(vane.id, { ikon: e.target.value })}
                className="w-14 rounded-lg border border-slate-600 bg-slate-900 px-2 py-2 text-center text-xl"
              />
              {/* Navn-feltet. */}
              <input
                aria-label="Navn"
                value={vane.navn}
                onChange={(e) => opdaterVane(vane.id, { navn: e.target.value })}
                className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-400">
                Point
                <input
                  type="number"
                  min={0}
                  value={vane.point}
                  onChange={(e) =>
                    // Number(...) laver teksten om til et tal.
                    // Er feltet tomt eller ugyldigt, bruger vi 0.
                    opdaterVane(vane.id, { point: Number(e.target.value) || 0 })
                  }
                  className="w-20 rounded-lg border border-slate-600 bg-slate-900 px-2 py-1 text-slate-100"
                />
              </label>

              <button
                type="button"
                onClick={() => sletVane(vane.id)}
                className="rounded-lg px-3 py-1 text-sm text-red-400 hover:bg-red-500/10"
              >
                Slet
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={tilfoejVane}
        className="rounded-xl border border-dashed border-slate-600 p-3 text-slate-300 hover:border-slate-500 hover:text-slate-100"
      >
        + Tilføj vane
      </button>
    </div>
  );
}
