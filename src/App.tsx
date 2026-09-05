import { useState, type ReactNode } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { STANDARD_VANER } from "./vaner";
import type { Afkrydsninger, Indstillinger, Todo } from "./types";
import { datoForskudt, datoLang, ugensDatoer, ugedagKort } from "./datoer";
import { VaneKort } from "./VaneKort";
import { beregnSamledePoint, beregnLevel } from "./point";
import { PointOversigt } from "./PointOversigt";
import { findTitel } from "./titler";
import { TitelBanner } from "./TitelBanner";
import { RedigerVaner } from "./RedigerVaner";
import { samletStreak, vaneStreak, erGroenDag } from "./streaks";
import { StreakBanner } from "./StreakBanner";
import { DatoHjaelper } from "./DatoHjaelper";
import { TodoListe } from "./TodoListe";

export default function App() {
  // Vanerne. Første gang appen åbnes, bruges standardlisten med de 10 vaner.
  const [vaner, setVaner] = useLocalStorage("vaner", STANDARD_VANER);

  // Alle afkrydsninger nogensinde, gemt pr. dato. Starter som et tomt objekt.
  const [afkrydsninger, setAfkrydsninger] = useLocalStorage<Afkrydsninger>(
    "afkrydsninger",
    {},
  );

  // Indstillinger. Lige nu kun tærsklen for en "grøn dag" (standard 7).
  const [indstillinger, setIndstillinger] = useLocalStorage<Indstillinger>(
    "indstillinger",
    { taerskel: 7 },
  );

  // Alle opgaver på to-do listen. Starter som en tom liste.
  const [todos, setTodos] = useLocalStorage<Todo[]>("todos", []);

  // Hvilken skærm vi kigger på. Gemmes IKKE - appen starter altid på "i-dag".
  const [visning, setVisning] = useState<"i-dag" | "rediger" | "todo">("i-dag");

  // Testværktøj: hvor mange dage vi har "rejst" væk fra den rigtige dag.
  // 0 = i dag. Gemmes ikke.
  const [datoForskydning, setDatoForskydning] = useState(0);

  // Den dato appen arbejder med lige nu (påvirket af testværktøjet).
  const dato = datoForskudt(datoForskydning);

  // Afkrydsningerne for netop denne dag (eller et tomt objekt).
  const dagensAfkrydsninger = afkrydsninger[dato] ?? {};

  // Skifter én vane mellem "gjort" og "ikke gjort" for den valgte dag.
  function skiftVane(vaneId: string) {
    setAfkrydsninger((tidligere) => {
      const dagen = tidligere[dato] ?? {};
      return {
        ...tidligere,
        [dato]: {
          ...dagen,
          [vaneId]: !dagen[vaneId],
        },
      };
    });
  }

  // Sæt tærsklen, men hold den mellem 1 og antallet af vaner.
  function saetTaerskel(ny: number) {
    const holdtIndenfor = Math.max(1, Math.min(ny, vaner.length));
    setIndstillinger({ ...indstillinger, taerskel: holdtIndenfor });
  }

  // Hvor mange af vanerne er klaret den valgte dag?
  const antalGjort = vaner.filter((vane) => dagensAfkrydsninger[vane.id]).length;

  // Tærsklen vi regner med. Hvis den gemte værdi er blevet for høj (fx fordi
  // vaner er slettet), klemmer vi den ned, så en grøn dag stadig er mulig.
  const taerskel = Math.max(1, Math.min(indstillinger.taerskel, vaner.length));

  // Samlede point og level. Regnes ud fra alle afkrydsninger nogensinde.
  const samledePoint = beregnSamledePoint(vaner, afkrydsninger);
  const levelInfo = beregnLevel(samledePoint);
  const titel = findTitel(levelInfo.level);

  // Den samlede dags-streak (grønne dage i træk), regnet fra den valgte dag.
  const streak = samletStreak(vaner, afkrydsninger, dato, taerskel);

  // Ugens 7 dage (mandag..søndag) til uge-sporet i streak-kortet.
  const ugensDage = ugensDatoer(dato).map((d) => ({
    dato: d,
    label: ugedagKort(d),
    groen: erGroenDag(vaner, afkrydsninger, d, taerskel),
    erIDag: d === dato,
    erFremtid: d > dato,
  }));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="mx-auto max-w-md flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-emerald-400">QuestLog</h1>
          <p className="text-slate-400 first-letter:uppercase">
            {datoLang(dato)}
          </p>
          <p className="text-sm text-slate-500">
            {antalGjort} af {vaner.length} vaner klaret
          </p>
        </header>

        {/* Advarsel når vi kigger på en anden dag end i dag. */}
        {datoForskydning !== 0 && (
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-sm text-amber-300">
            Du kigger på en anden dag end i dag ({datoForskydning > 0 ? "+" : ""}
            {datoForskydning} dage).
          </p>
        )}

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
          <FaneKnap
            aktiv={visning === "todo"}
            onClick={() => setVisning("todo")}
          >
            To-do
          </FaneKnap>
        </nav>

        {visning === "i-dag" && (
          <>
            <TitelBanner titel={titel} level={levelInfo.level} />

            <PointOversigt samledePoint={samledePoint} levelInfo={levelInfo} />

            <StreakBanner
              streak={streak}
              taerskel={taerskel}
              antalVaner={vaner.length}
              gjortIDag={antalGjort}
              ugensDage={ugensDage}
              onTaerskel={saetTaerskel}
            />

            <ul className="flex flex-col gap-3">
              {vaner.map((vane) => (
                <VaneKort
                  key={vane.id}
                  vane={vane}
                  gjort={Boolean(dagensAfkrydsninger[vane.id])}
                  streak={vaneStreak(afkrydsninger, vane.id, dato)}
                  onSkift={() => skiftVane(vane.id)}
                />
              ))}
            </ul>
          </>
        )}

        {visning === "rediger" && (
          <RedigerVaner vaner={vaner} setVaner={setVaner} />
        )}

        {visning === "todo" && (
          <TodoListe todos={todos} setTodos={setTodos} />
        )}

        <DatoHjaelper
          forskydning={datoForskydning}
          onSkift={setDatoForskydning}
        />
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
