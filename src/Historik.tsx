import { useState, type ReactNode } from "react";
import type { Vane, Afkrydsninger } from "./types";
import { antalGjortPaaDato, erGroenDag } from "./streaks";
import { pointForDatoer } from "./point";
import {
  maanedensDatoer,
  tommeFoerMaaned,
  maanedNavn,
  dagIMaaned,
  datoLang,
  ugensDatoer,
  dagenFoer,
} from "./datoer";

type Props = {
  vaner: Vane[];
  afkrydsninger: Afkrydsninger;
  noter: Record<string, string>; // dagbogs-noter pr. dato
  taerskel: number;
  iDag: string; // dagens dato
};

// Ugedags-overskrifterne i kalenderen. Ugen starter om mandag.
const UGEDAGE = ["ma", "ti", "on", "to", "fr", "lø", "sø"];

// En kalender-visning: én måned ad gangen, hvor hver dag er farvet efter,
// hvor godt den gik. Grøn = du nåede tærsklen, gul = du gjorde noget men
// ikke nok, grå = ingenting.
export function Historik({
  vaner,
  afkrydsninger,
  noter,
  taerskel,
  iDag,
}: Props) {
  // Hvilken måned vi kigger på. Starter på den måned, "i dag" ligger i.
  const [vist, setVist] = useState(() => {
    const [aar, maaned] = iDag.split("-").map(Number);
    return { aar, maaned0: maaned - 1 }; // maaned0 er 0-baseret
  });

  // Hvilken dag i kalenderen der er trykket på (eller null). Bruges til
  // dag-detaljerne under kalenderen.
  const [valgtDato, setValgtDato] = useState<string | null>(null);

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

  // --- Uge for uge ---
  // Én række pr. uge fra denne uge og bagud til den uge, hvor den første
  // afkrydsning ligger. Så kan man se, hvornår man har klaret det bedst.
  const alleDatoer = Object.keys(afkrydsninger).sort();
  const foersteDato = alleDatoer[0];
  const denneUgeMandag = ugensDatoer(iDag)[0];
  const stopMandag = foersteDato ? ugensDatoer(foersteDato)[0] : denneUgeMandag;

  const uger: {
    mandag: string;
    dage: { dato: string; groen: boolean; fremtid: boolean }[];
    groenne: number;
    point: number;
    erDenneUge: boolean;
  }[] = [];

  let mandag = denneUgeMandag;
  // "guard" er bare en sikkerhedsstopper, så vi aldrig kan løkke i det uendelige.
  for (let guard = 0; mandag >= stopMandag && guard < 260; guard++) {
    const ugeDatoer = ugensDatoer(mandag);
    const dage = ugeDatoer.map((d) => ({
      dato: d,
      groen: d <= iDag && erGroenDag(vaner, afkrydsninger, d, taerskel),
      fremtid: d > iDag,
    }));
    const synlige = ugeDatoer.filter((d) => d <= iDag);
    uger.push({
      mandag,
      dage,
      groenne: dage.filter((d) => d.groen).length,
      point: pointForDatoer(vaner, afkrydsninger, synlige),
      erDenneUge: mandag === denneUgeMandag,
    });
    // Gå til mandagen i ugen før.
    mandag = ugensDatoer(dagenFoer(mandag))[0];
  }

  // Den bedste uge = flest grønne dage (point som tie-breaker).
  const bedste = uger.reduce(
    (b, u) =>
      u.groenne > b.groenne || (u.groenne === b.groenne && u.point > b.point)
        ? u
        : b,
    uger[0],
  );
  // Kun kron en "bedste uge", hvis der faktisk er noget at kåre.
  const harBedste = bedste && bedste.groenne > 0;

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

        {/* Én rude pr. dag i måneden. Tryk for at se detaljer om dagen. */}
        {datoer.map((dato) => {
          const antal = antalGjortPaaDato(vaner, afkrydsninger, dato);
          const groen = antal >= taerskel;
          const erIDag = dato === iDag;
          const erFremtid = dato > iDag;
          const harNote = Boolean(noter[dato]);

          // Baggrundsfarve efter hvor godt dagen gik.
          let farve = "bg-slate-800 text-slate-500";
          if (groen) farve = "bg-emerald-500/80 text-slate-900 font-semibold";
          else if (antal > 0) farve = "bg-amber-500/25 text-amber-200";

          return (
            <button
              key={dato}
              type="button"
              onClick={() =>
                setValgtDato((d) => (d === dato ? null : dato))
              }
              title={`${antal} af ${vaner.length} vaner`}
              className={
                "relative flex aspect-square items-center justify-center rounded-md text-sm " +
                farve +
                (erFremtid ? " opacity-40" : "") +
                (dato === valgtDato
                  ? " ring-2 ring-sky-400"
                  : erIDag
                    ? " ring-2 ring-emerald-400"
                    : "")
              }
            >
              {dagIMaaned(dato)}
              {/* Lille prik hvis dagen har en note. */}
              {harNote && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-current opacity-70" />
              )}
            </button>
          );
        })}
      </div>

      {/* Detaljer om den valgte dag. */}
      {valgtDato && (
        <DagDetaljer
          dato={valgtDato}
          vaner={vaner}
          dagen={afkrydsninger[valgtDato] ?? {}}
          note={noter[valgtDato] ?? ""}
          onLuk={() => setValgtDato(null)}
        />
      )}

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

      {/* Uge for uge - så man kan konkurrere mod sig selv. */}
      <div className="mt-2 flex flex-col gap-2 border-t border-slate-700 pt-4">
        <h2 className="text-sm font-semibold text-slate-300">Uge for uge</h2>
        {harBedste && (
          <p className="text-sm text-slate-400">
            Din bedste uge: {bedste.groenne} grønne{" "}
            {bedste.groenne === 1 ? "dag" : "dage"} 🏆
          </p>
        )}
        <div className="flex flex-col gap-1">
          {uger.map((uge) => (
            <UgeRaekke
              key={uge.mandag}
              uge={uge}
              erBedste={harBedste && uge.mandag === bedste.mandag}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// "2026-09-07" -> "7. sep" (kort, uden årstal).
function kortDato(iso: string): string {
  const [aar, maaned, dag] = iso.split("-").map(Number);
  return new Date(aar, maaned - 1, dag)
    .toLocaleDateString("da-DK", { day: "numeric", month: "short" })
    .replaceAll(".", "");
}

// Én uge i uge-for-uge-listen: dato-interval + et 7-felts spor + tælleren.
function UgeRaekke({
  uge,
  erBedste,
}: {
  uge: {
    dage: { dato: string; groen: boolean; fremtid: boolean }[];
    groenne: number;
    point: number;
    erDenneUge: boolean;
  };
  erBedste: boolean;
}) {
  const label =
    kortDato(uge.dage[0].dato) + "–" + kortDato(uge.dage[6].dato);

  return (
    <div
      title={`${uge.point} point`}
      className={
        "flex items-center gap-3 rounded-lg px-2 py-1.5 " +
        (erBedste ? "bg-emerald-500/10" : "")
      }
    >
      <span className="w-28 flex-none text-xs text-slate-400">
        {label}
        {uge.erDenneUge && (
          <span className="text-emerald-400"> · nu</span>
        )}
      </span>

      {/* 7 små felter - ét pr. dag i ugen. */}
      <div className="flex flex-1 gap-0.5">
        {uge.dage.map((d) => (
          <span
            key={d.dato}
            className={
              "h-4 flex-1 rounded-sm " +
              (d.groen
                ? "bg-emerald-500"
                : d.fremtid
                  ? "bg-slate-800"
                  : "bg-slate-700")
            }
          />
        ))}
      </div>

      <span className="w-10 flex-none text-right text-sm font-semibold text-slate-200">
        {uge.groenne}/7
      </span>
      <span className="w-4 flex-none">{erBedste ? "🏆" : ""}</span>
    </div>
  );
}

// Detaljer om én dag: hvilke vaner blev klaret, og dagens note.
function DagDetaljer({
  dato,
  vaner,
  dagen,
  note,
  onLuk,
}: {
  dato: string;
  vaner: Vane[];
  dagen: { [vaneId: string]: boolean };
  note: string;
  onLuk: () => void;
}) {
  const klarede = vaner.filter((v) => dagen[v.id]);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-700 bg-slate-800 p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-slate-200 first-letter:uppercase">
          {datoLang(dato)}
        </span>
        <button
          type="button"
          onClick={onLuk}
          aria-label="Luk"
          className="flex-none rounded-md px-2 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
        >
          ✕
        </button>
      </div>

      {klarede.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {klarede.map((v) => (
            <li
              key={v.id}
              className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-slate-300"
            >
              {v.ikon} {v.navn}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-500">Ingen vaner krydset af.</p>
      )}

      {note && (
        <p className="whitespace-pre-wrap border-t border-slate-700 pt-2 text-sm text-slate-300">
          {note}
        </p>
      )}
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
