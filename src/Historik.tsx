import { useState, type ReactNode } from "react";
import type { Vane, Afkrydsninger } from "./types";
import { antalGjortPaaDato } from "./streaks";
import {
  maanedensDatoer,
  tommeFoerMaaned,
  maanedNavn,
  dagIMaaned,
} from "./datoer";

type Props = {
  vaner: Vane[];
  afkrydsninger: Afkrydsninger;
  taerskel: number;
  iDag: string; // dagens dato (kan være flyttet af testværktøjet)
};

// Ugedags-overskrifterne i kalenderen. Ugen starter om mandag.
const UGEDAGE = ["ma", "ti", "on", "to", "fr", "lø", "sø"];

// En kalender-visning: én måned ad gangen, hvor hver dag er farvet efter,
// hvor godt den gik. Grøn = du nåede tærsklen, gul = du gjorde noget men
// ikke nok, grå = ingenting.
export function Historik({ vaner, afkrydsninger, taerskel, iDag }: Props) {
  // Hvilken måned vi kigger på. Starter på den måned, "i dag" ligger i.
  const [vist, setVist] = useState(() => {
    const [aar, maaned] = iDag.split("-").map(Number);
    return { aar, maaned0: maaned - 1 }; // maaned0 er 0-baseret
  });

  // Gå en måned frem eller tilbage. Vi lader Date klare årsskifte selv.
  function skiftMaaned(retning: number) {
    const d = new Date(vist.aar, vist.maaned0 + retning, 1);
    setVist({ aar: d.getFullYear(), maaned0: d.getMonth() });
  }

  const datoer = maanedensDatoer(vist.aar, vist.maaned0);
  const tomme = tommeFoerMaaned(vist.aar, vist.maaned0);

  // Tæl grønne dage i den viste måned (til den lille opsummering).
  const groenneDage = datoer.filter(
    (dato) => antalGjortPaaDato(vaner, afkrydsninger, dato) >= taerskel,
  ).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Måneds-vælger: pil tilbage, månedens navn, pil frem. */}
      <div className="flex items-center justify-between">
        <PilKnap onClick={() => skiftMaaned(-1)} label="Forrige måned">
          ◀
        </PilKnap>
        <span className="font-semibold">
          {maanedNavn(vist.aar, vist.maaned0)}
        </span>
        <PilKnap onClick={() => skiftMaaned(1)} label="Næste måned">
          ▶
        </PilKnap>
      </div>

      {/* Selve kalenderen: 7 kolonner. */}
      <div className="grid grid-cols-7 gap-1">
        {/* Ugedags-overskrifter. */}
        {UGEDAGE.map((dag) => (
          <div
            key={dag}
            className="pb-1 text-center text-xs font-medium text-slate-500"
          >
            {dag}
          </div>
        ))}

        {/* Tomme felter, så den 1. lander på den rigtige ugedag. */}
        {Array.from({ length: tomme }).map((_, i) => (
          <div key={"tom-" + i} />
        ))}

        {/* Én rude pr. dag i måneden. */}
        {datoer.map((dato) => {
          const antal = antalGjortPaaDato(vaner, afkrydsninger, dato);
          const groen = antal >= taerskel;
          const erIDag = dato === iDag;
          const erFremtid = dato > iDag;

          // Baggrundsfarve efter hvor godt dagen gik.
          let farve = "bg-slate-800 text-slate-500";
          if (groen) farve = "bg-emerald-500/80 text-slate-900 font-semibold";
          else if (antal > 0) farve = "bg-amber-500/25 text-amber-200";

          return (
            <div
              key={dato}
              title={`${antal} af ${vaner.length} vaner`}
              className={
                "flex aspect-square items-center justify-center rounded-md text-sm " +
                farve +
                (erFremtid ? " opacity-40" : "") +
                (erIDag ? " ring-2 ring-emerald-400" : "")
              }
            >
              {dagIMaaned(dato)}
            </div>
          );
        })}
      </div>

      {/* Lille opsummering + forklaring på farverne. */}
      <p className="text-sm text-slate-400">
        {groenneDage} grønne{" "}
        {groenneDage === 1 ? "dag" : "dage"} i {maanedNavn(vist.aar, vist.maaned0)}
      </p>
      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <Forklaring farve="bg-emerald-500/80">Grøn dag</Forklaring>
        <Forklaring farve="bg-amber-500/25">Noget gjort</Forklaring>
        <Forklaring farve="bg-slate-800">Ingenting</Forklaring>
      </div>
    </div>
  );
}

// Lille pileknap til at skifte måned.
function PilKnap({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="rounded-md bg-slate-800 px-3 py-1 text-slate-300 hover:bg-slate-700"
    >
      {children}
    </button>
  );
}

// En lille farveprøve med tekst, brugt i forklaringen under kalenderen.
function Forklaring({
  farve,
  children,
}: {
  farve: string;
  children: ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={"h-3 w-3 rounded-sm " + farve} />
      {children}
    </span>
  );
}
