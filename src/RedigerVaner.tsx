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

  // Flyt en vane én plads op (retning -1) eller ned (retning +1).
  // Rækkefølgen i listen er den, vanerne vises i på "Hjem"-skærmen.
  function flytVane(id: string, retning: -1 | 1) {
    setVaner((gamle) => {
      const i = gamle.findIndex((v) => v.id === id);
      const j = i + retning;
      // Er vi allerede yderst? Så gør vi ingenting.
      if (i === -1 || j < 0 || j >= gamle.length) return gamle;
      const ny = [...gamle];
      // Byt de to vaner om.
      [ny[i], ny[j]] = [ny[j], ny[i]];
      return ny;
    });
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
        {vaner.map((vane, index) => (
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
              {/* Flyt vanen op/ned - ændrer rækkefølgen på Hjem-skærmen. */}
              <div className="flex flex-none flex-col">
                <button
                  type="button"
                  onClick={() => flytVane(vane.id, -1)}
                  disabled={index === 0}
                  aria-label="Flyt op"
                  className="flex-1 rounded-t-lg border border-slate-600 px-2 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => flytVane(vane.id, 1)}
                  disabled={index === vaner.length - 1}
                  aria-label="Flyt ned"
                  className="flex-1 rounded-b-lg border border-t-0 border-slate-600 px-2 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-30"
                >
                  ▼
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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

              {/* Valgfrit: kroner sparet pr. dag vanen holdes. 0 = ingen
                  penge-visning på kortet. */}
              <label className="flex items-center gap-2 text-sm text-slate-400">
                Sparer kr/dag
                <input
                  type="number"
                  min={0}
                  value={vane.sparerPrDag ?? 0}
                  onChange={(e) =>
                    opdaterVane(vane.id, {
                      sparerPrDag: Number(e.target.value) || 0,
                    })
                  }
                  className="w-20 rounded-lg border border-slate-600 bg-slate-900 px-2 py-1 text-slate-100"
                />
              </label>

              {/* Valgfrit: mål pr. uge. 0 = daglig vane (helt som før).
                  Et tal fra 1-7 gør den til en uge-vane, fx Sauna 4 gange
                  om ugen. */}
              <label className="flex items-center gap-2 text-sm text-slate-400">
                Mål pr. uge
                <input
                  type="number"
                  min={0}
                  max={7}
                  value={vane.maalPrUge ?? 0}
                  onChange={(e) =>
                    opdaterVane(vane.id, {
                      // Hold tallet mellem 0 og 7.
                      maalPrUge: Math.max(
                        0,
                        Math.min(7, Number(e.target.value) || 0),
                      ),
                    })
                  }
                  className="w-20 rounded-lg border border-slate-600 bg-slate-900 px-2 py-1 text-slate-100"
                />
              </label>

              <button
                type="button"
                onClick={() => sletVane(vane.id)}
                className="ml-auto rounded-lg px-3 py-1 text-sm text-red-400 hover:bg-red-500/10"
              >
                Slet
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-xs text-slate-500">
        <strong>Mål pr. uge:</strong> lad den stå på 0, hvis vanen skal gøres
        hver dag. Sæt den til fx 4, hvis vanen kun skal gøres 4 gange om ugen -
        så viser kortet "3 / 4 i denne uge" i stedet for en dags-stime.
      </p>

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
