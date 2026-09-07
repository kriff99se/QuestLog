import { useRef, type ChangeEvent } from "react";

// De nøgler i localStorage, som appen bruger. Alt andet rører vi ikke.
const NOEGLER = [
  "vaner",
  "afkrydsninger",
  "indstillinger",
  "todos",
  "noter",
] as const;

// To knapper nederst i appen: gem alle data som en .json-fil, eller
// læs en tidligere fil ind igen. Nyttigt fordi data ellers kun lever
// ét sted (den browser / telefon).
export function Backup() {
  // Skjult fil-vælger. Vi "klikker" på den fra "Indlæs backup"-knappen.
  const filInput = useRef<HTMLInputElement>(null);

  // Saml alle appens data i ét objekt og hent det som en fil.
  async function gemBackup() {
    const data: Record<string, unknown> = {};
    for (const noegle of NOEGLER) {
      const raw = localStorage.getItem(noegle);
      if (raw !== null) data[noegle] = JSON.parse(raw);
    }

    const fil = {
      app: "QuestLog",
      version: 1,
      gemt: new Date().toISOString(),
      data,
    };

    const tekst = JSON.stringify(fil, null, 2);
    const idag = new Date().toISOString().slice(0, 10); // fx "2026-09-06"
    const filnavn = `questlog-backup-${idag}.json`;
    const blob = new Blob([tekst], { type: "application/json" });

    // På telefon: brug "del"-arket, hvis det kan dele filer - så kan man
    // gemme i Filer, sende til sig selv på mail osv. Ellers falder vi
    // tilbage til et helt almindeligt download-link.
    const filObjekt = new File([blob], filnavn, { type: "application/json" });
    if (
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [filObjekt] })
    ) {
      try {
        await navigator.share({ files: [filObjekt], title: "QuestLog backup" });
      } catch {
        // Brugeren lukkede del-arket - så gør vi ikke mere.
      }
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filnavn;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Kaldes når brugeren har valgt en fil i fil-vælgeren.
  function haandterFil(e: ChangeEvent<HTMLInputElement>) {
    const fil = e.target.files?.[0];
    e.target.value = ""; // nulstil, så samme fil kan vælges igen senere
    if (!fil) return;

    const laeser = new FileReader();
    laeser.onload = () => {
      try {
        const parsed = JSON.parse(String(laeser.result));
        // Vi accepterer både hele backup-filen og bare "data"-delen.
        const data = parsed?.data ?? parsed;
        if (typeof data !== "object" || data === null) {
          throw new Error("Filen ligner ikke en QuestLog-backup.");
        }

        const sikker = window.confirm(
          "Indlæs backup?\n\nAlt nuværende data (vaner, afkrydsninger, " +
            "streaks og opgaver) bliver erstattet af filens indhold.",
        );
        if (!sikker) return;

        for (const noegle of NOEGLER) {
          if (noegle in data) {
            localStorage.setItem(noegle, JSON.stringify(data[noegle]));
          }
        }

        // Genindlæs siden, så appen læser de nye data ind fra bunden.
        location.reload();
      } catch (fejl) {
        window.alert(
          "Kunne ikke læse filen: " +
            (fejl instanceof Error ? fejl.message : "ukendt fejl"),
        );
      }
    };
    laeser.readAsText(fil);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-700 p-3 text-sm">
      <span className="text-slate-400">Sikkerhedskopi af dine data</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={gemBackup}
          className="rounded-lg bg-slate-800 px-3 py-1 text-slate-200 hover:bg-slate-700"
        >
          Gem backup
        </button>
        <button
          type="button"
          onClick={() => filInput.current?.click()}
          className="rounded-lg bg-slate-800 px-3 py-1 text-slate-200 hover:bg-slate-700"
        >
          Indlæs backup
        </button>
      </div>

      {/* Selve fil-vælgeren er skjult - vi styrer den fra knappen ovenfor. */}
      <input
        ref={filInput}
        type="file"
        accept="application/json,.json"
        onChange={haandterFil}
        className="hidden"
      />
    </div>
  );
}
