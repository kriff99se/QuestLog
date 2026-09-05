import { useState, type ReactNode } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { STANDARD_VANER } from "./vaner";
import type { Afkrydsninger } from "./types";
import { iDagISO, iDagLang } from "./datoer";
import { VaneKort } from "./VaneKort";
import { beregnSamledePoint, beregnLevel } from "./point";
import { PointOversigt } from "./PointOversigt";
import { findTitel } from "./titler";
import { TitelBanner } from "./TitelBanner";
import { RedigerVaner } from "./RedigerVaner";

export default function App() {
  // Vanerne. Første gang appen åbnes, bruges standardlisten med de 10 vaner.
  // Fra Fase 3 kan de redigeres i appen (se RedigerVaner).
  const [vaner, setVaner] = useLocalStorage("vaner", STANDARD_VANER);

  // Alle afkrydsninger nogensinde, gemt pr. dato. Starter som et tomt objekt.
  const [afkrydsninger, setAfkrydsninger] = useLocalStorage<Afkrydsninger>(
    "afkrydsninger",
    {},
  );

  // Hvilken skærm vi kigger på: dagens vaner eller redigerings-skærmen.
  // Dette skal IKKE gemmes - appen starter altid på "i-dag".
  const [visning, setVisning] = useState<"i-dag" | "rediger">("i-dag");

  const dato = iDagISO();
  // Afkrydsningerne for netop i dag (eller et tomt objekt, hvis der ingen er endnu).
  const dagensAfkrydsninger = afkrydsninger[dato] ?? {};

  // Skifter én vane mellem "gjort" og "ikke gjort" for i dag.
  function skiftVane(vaneId: string) {
    setAfkrydsninger((tidligere) => {
      const dagen = tidligere[dato] ?? {};
      return {
        // Behold alle de andre dage som de var...
        ...tidligere,
        // ...og lav en ny udgave af dagens afkrydsninger,
        // hvor netop denne vane vendes om (true bliver false og omvendt).
        [dato]: {
          ...dagen,
          [vaneId]: !dagen[vaneId],
        },
      };
    });
  }

  // Hvor mange af vanerne er klaret i dag?
  const antalGjort = vaner.filter((vane) => dagensAfkrydsninger[vane.id]).length;

  // Samlede point og level. Regnes ud fra alle afkrydsninger nogensinde,
  // så tallene altid passer med data. Ændrer sig automatisk, når du
  // krydser en vane af eller fra - eller ændrer en vanes point.
  const samledePoint = beregnSamledePoint(vaner, afkrydsninger);
  const levelInfo = beregnLevel(samledePoint);

  // Titlen der hører til dit nuværende level (fx "Noob" eller "Zyzz").
  const titel = findTitel(levelInfo.level);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="mx-auto max-w-md flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-emerald-400">QuestLog</h1>
          {/* first-letter:uppercase gør det første bogstav stort,
              så der står "Fredag den 5. september 2026". */}
          <p className="text-slate-400 first-letter:uppercase">{iDagLang()}</p>
          <p className="text-sm text-slate-500">
            {antalGjort} af {vaner.length} vaner klaret i dag
          </p>
        </header>

        {/* Menu til at skifte mellem de to skærme. */}
        <nav className="flex gap-2">
          <FaneKnap
            aktiv={visning === "i-dag"}
            onClick={() => setVisning("i-dag")}
          >
            I dag
          </FaneKnap>
          <FaneKnap
            aktiv={visning === "rediger"}
            onClick={() => setVisning("rediger")}
          >
            Rediger vaner
          </FaneKnap>
        </nav>

        {/* Vis den ene eller den anden skærm alt efter "visning". */}
        {visning === "i-dag" ? (
          <>
            <TitelBanner titel={titel} level={levelInfo.level} />

            <PointOversigt samledePoint={samledePoint} levelInfo={levelInfo} />

            <ul className="flex flex-col gap-3">
              {vaner.map((vane) => (
                <VaneKort
                  key={vane.id}
                  vane={vane}
                  gjort={Boolean(dagensAfkrydsninger[vane.id])}
                  onSkift={() => skiftVane(vane.id)}
                />
              ))}
            </ul>
          </>
        ) : (
          <RedigerVaner vaner={vaner} setVaner={setVaner} />
        )}
      </div>
    </div>
  );
}

// Én knap i menuen. "aktiv" styrer om knappen ser valgt ud.
function FaneKnap({
  aktiv,
  onClick,
  children,
}: {
  aktiv: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-lg px-3 py-1.5 text-sm transition-colors " +
        (aktiv
          ? "bg-emerald-500 text-slate-900"
          : "bg-slate-800 text-slate-300 hover:bg-slate-700")
      }
    >
      {children}
    </button>
  );
}
