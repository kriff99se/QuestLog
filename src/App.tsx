import { useState, useEffect, useRef, type ReactNode } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { STANDARD_VANER } from "./vaner";
import type { Afkrydsninger, Indstillinger, Todo } from "./types";
import { datoForskudt, datoLang, ugensDatoer, ugedagKort } from "./datoer";
import { VaneKort } from "./VaneKort";
import { beregnSamledePoint, beregnOpgavePoint, beregnLevel } from "./point";
import { PointOversigt } from "./PointOversigt";
import { findTitel } from "./titler";
import { TitelBanner } from "./TitelBanner";
import { RedigerVaner } from "./RedigerVaner";
import { samletStreak, vaneStreak, erGroenDag } from "./streaks";
import { StreakBanner } from "./StreakBanner";
import { DatoHjaelper } from "./DatoHjaelper";
import { TodoListe } from "./TodoListe";
import { Fejring } from "./Fejring";
import { Historik } from "./Historik";
import { NulstilAlt } from "./NulstilAlt";

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
  const [visning, setVisning] = useState<
    "i-dag" | "rediger" | "todo" | "historik"
  >("i-dag");

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

  // Sletter ALT og starter forfra. NulstilAlt har allerede spurgt to gange,
  // så her gør vi bare rent: alle data tilbage til deres startværdi.
  function nulstilAlt() {
    setVaner(STANDARD_VANER);
    setAfkrydsninger({});
    setIndstillinger({ taerskel: 7 });
    setTodos([]);
    setDatoForskydning(0);
    setVisning("i-dag");
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

  // Samlede point og level. Point kommer fra to steder:
  // alle vane-afkrydsninger nogensinde + alle færdige to-do opgaver.
  const samledePoint =
    beregnSamledePoint(vaner, afkrydsninger) + beregnOpgavePoint(todos);
  const levelInfo = beregnLevel(samledePoint);
  const titel = findTitel(levelInfo.level);

  // Den samlede dags-streak (grønne dage i træk), regnet fra den valgte dag.
  const streak = samletStreak(vaner, afkrydsninger, dato, taerskel);

  // --- Animationer (Fase 6) ---
  //
  // Vi vil gerne vise et lille "+X", når pointtallet stiger, og en kort
  // fejring, når man går et level op. For at opdage det, husker vi det
  // forrige tal og sammenligner efter hver ændring.
  //
  // useRef er en "kasse", der overlever gentegninger uden selv at udløse
  // en ny gentegning - god til at huske "hvad var værdien sidst".
  const forrigePoint = useRef(samledePoint);
  const forrigeLevel = useRef(levelInfo.level);

  // Det "+X" der lige nu svæver op (eller null hvis der ikke er noget).
  // id'et skifter hver gang, så animationen kan starte forfra.
  const [flyvendePoint, setFlyvendePoint] = useState<{
    id: number;
    maengde: number;
  } | null>(null);

  // Hvilket level vi fejrer lige nu (eller null hvis ingen fejring).
  const [fejrLevel, setFejrLevel] = useState<number | null>(null);

  // Kør dette hver gang point eller level ændrer sig.
  useEffect(() => {
    // Mens man "tidsrejser" med testværktøjet, springer vi animationerne
    // over - ellers ville man få fejringer for point på andre dage.
    if (datoForskydning !== 0) {
      forrigePoint.current = samledePoint;
      forrigeLevel.current = levelInfo.level;
      return;
    }

    // Er pointtallet steget? Så vis forskellen som et "+X".
    const forskel = samledePoint - forrigePoint.current;
    if (forskel > 0) {
      setFlyvendePoint({ id: Date.now(), maengde: forskel });
    }
    forrigePoint.current = samledePoint;

    // Er vi gået mindst ét level op? Så fejr det nye level.
    if (levelInfo.level > forrigeLevel.current) {
      setFejrLevel(levelInfo.level);
    }
    forrigeLevel.current = levelInfo.level;
  }, [samledePoint, levelInfo.level, datoForskydning]);

  // Fjern "+X" igen efter 1 sekund (lige så længe som animationen varer).
  // Vi bruger en timer i stedet for at vente på at animationen slutter, så
  // det også virker, hvis brugeren har slået bevægelse fra i sit system.
  useEffect(() => {
    if (flyvendePoint === null) return;
    const timer = setTimeout(() => setFlyvendePoint(null), 1000);
    return () => clearTimeout(timer);
  }, [flyvendePoint]);

  // Luk fejringen af sig selv efter 2,5 sekunder.
  useEffect(() => {
    if (fejrLevel === null) return;
    const timer = setTimeout(() => setFejrLevel(null), 2500);
    // Ryd op, hvis fejringen skifter, inden tiden er gået.
    return () => clearTimeout(timer);
  }, [fejrLevel]);

  // Ugens 7 dage (mandag..søndag) til uge-sporet i streak-kortet.
  const ugensDage = ugensDatoer(dato).map((d) => ({
    dato: d,
    label: ugedagKort(d),
    groen: erGroenDag(vaner, afkrydsninger, d, taerskel),
    erIDag: d === dato,
    erFremtid: d > dato,
  }));

  return (
    // "p-4 sm:p-6": lidt luft på mobil, mere luft på større skærme.
    // "overflow-x-clip": siden må aldrig kunne scrolles vandret. Vi bruger
    // "clip" og ikke "hidden", fordi "hidden" ville ødelægge "sticky"-kortet
    // længere nede (level-kortet der klæber fast øverst).
    <div className="min-h-screen overflow-x-clip bg-slate-900 text-slate-100 p-4 sm:p-6">
      <div className="mx-auto flex max-w-md flex-col gap-6">
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

        {/* Menu til at skifte mellem skærmene. "flex-wrap" lader knapperne
            bryde om på en ny linje, hvis der ikke er plads (fx på mobil). */}
        <nav className="flex flex-wrap gap-2">
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
          <FaneKnap
            aktiv={visning === "historik"}
            onClick={() => setVisning("historik")}
          >
            Historik
          </FaneKnap>
        </nav>

        {visning === "i-dag" && (
          <>
            <TitelBanner titel={titel} level={levelInfo.level} />

            {/* Point-kortet.
                - "sticky top-0" får kortet til at "klæbe" fast øverst på
                  skærmen, så man altid kan se sit level, også når man har
                  scrollet langt ned i vane-listen.
                - "z-20" lægger det oven på de vane-kort, der scroller forbi.
                - "shadow-md" giver en lille skygge, så det tydeligt ligger
                  oven på indholdet.
                Laget her fungerer også som anker for det svævende "+X". */}
            <div className="sticky top-0 z-20 rounded-xl shadow-md shadow-slate-950/40">
              <PointOversigt samledePoint={samledePoint} levelInfo={levelInfo} />

              {flyvendePoint && (
                <span
                  // Ny key hver gang = React laver et frisk element, så
                  // CSS-animationen "animer-flyv-op" starter forfra.
                  key={flyvendePoint.id}
                  className="animer-flyv-op pointer-events-none absolute right-4 top-3 text-lg font-bold text-emerald-300"
                >
                  +{flyvendePoint.maengde}
                </span>
              )}
            </div>

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

        {visning === "historik" && (
          <Historik
            vaner={vaner}
            afkrydsninger={afkrydsninger}
            taerskel={taerskel}
            iDag={dato}
          />
        )}

        <DatoHjaelper
          forskydning={datoForskydning}
          onSkift={setDatoForskydning}
        />

        <NulstilAlt onNulstil={nulstilAlt} />
      </div>

      {/* Fejringen ligger uden for midterspalten, så den kan dække hele skærmen. */}
      <Fejring level={fejrLevel} onLuk={() => setFejrLevel(null)} />
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
