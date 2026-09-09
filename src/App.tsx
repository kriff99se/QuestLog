import { useState, useEffect, useRef } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { STANDARD_VANER } from "./vaner";
import type { Afkrydsninger, Indstillinger, Todo } from "./types";
import { iDagISO, ugensDatoer, ugedagKort } from "./datoer";
import { VaneKort } from "./VaneKort";
import {
  beregnSamledePoint,
  beregnOpgavePoint,
  beregnLevel,
  ugensPoint,
  STANDARD_UGEMAAL,
} from "./point";
import { findTitel } from "./titler";
import { RedigerVaner } from "./RedigerVaner";
import {
  samletStreak,
  vaneStreak,
  erGroenDag,
  antalDageVaneGjort,
  laengsteStreak,
  gjortIUge,
  ugeStreak,
  ugeMaalStreak,
  laengsteUgeMaalStreak,
} from "./streaks";
import { StreakBanner } from "./StreakBanner";
import { StatusStribe } from "./StatusStribe";
import { DagNote } from "./DagNote";
import { TodoListe } from "./TodoListe";
import { Fejring } from "./Fejring";
import { Historik } from "./Historik";
import { Backup } from "./Backup";
import { NulstilAlt } from "./NulstilAlt";
import { BundMenu, type Visning } from "./BundMenu";
import { Trofaeer } from "./Trofaeer";
import { TrofaeFejring } from "./TrofaeFejring";
import {
  opnaaedeTrofaeer,
  type TrofaeData,
  type Trofae,
} from "./achievements";

export default function App() {
  // Vanerne. Første gang appen åbnes, bruges standardlisten med de 10 vaner.
  const [vaner, setVaner] = useLocalStorage("vaner", STANDARD_VANER);

  // Alle afkrydsninger nogensinde, gemt pr. dato. Starter som et tomt objekt.
  const [afkrydsninger, setAfkrydsninger] = useLocalStorage<Afkrydsninger>(
    "afkrydsninger",
    {},
  );

  // Indstillinger: tærsklen for en "grøn dag" i kalenderen (standard 7),
  // og uge-målet i point (standard STANDARD_UGEMAAL).
  const [indstillinger, setIndstillinger] = useLocalStorage<Indstillinger>(
    "indstillinger",
    { taerskel: 7, ugeMaal: STANDARD_UGEMAAL },
  );

  // Alle opgaver på to-do listen. Starter som en tom liste.
  const [todos, setTodos] = useLocalStorage<Todo[]>("todos", []);

  // Dagbogs-noter, ét stykke tekst pr. dato. Starter som et tomt objekt.
  const [noter, setNoter] = useLocalStorage<Record<string, string>>("noter", {});

  // Engangs-opdatering: "Ingen snus"-vaner fra før penge-funktionen mangler
  // feltet "sparerPrDag". Hvis det aldrig er sat, giver vi den 60 kr/dag,
  // så besparelsen dukker op automatisk uden at man skal ind og rette den.
  // Har man selv sat et beløb (også 0), rører vi det ikke.
  useEffect(() => {
    const snus = vaner.find((v) => v.id === "ingen-snus");
    if (snus && snus.sparerPrDag === undefined) {
      setVaner((gamle) =>
        gamle.map((v) =>
          v.id === "ingen-snus" ? { ...v, sparerPrDag: 60 } : v,
        ),
      );
    }
  }, [vaner, setVaner]);

  // Engangs-opdatering: gamle gemte indstillinger har ikke feltet "ugeMaal".
  // Sæt det til standardværdien, så uge-målet dukker op af sig selv.
  useEffect(() => {
    if (indstillinger.ugeMaal === undefined) {
      setIndstillinger((gamle) => ({ ...gamle, ugeMaal: STANDARD_UGEMAAL }));
    }
  }, [indstillinger, setIndstillinger]);

  // Hvilken skærm vi kigger på. Gemmes IKKE - appen starter altid på "i-dag".
  const [visning, setVisning] = useState<Visning>("i-dag");

  // Dagens dato som "2026-09-06". Appen arbejder altid med i dag.
  const dato = iDagISO();

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

  // Skriver (eller rydder) dagens note.
  function saetNote(tekst: string) {
    setNoter((tidligere) => {
      const ny = { ...tidligere };
      if (tekst.trim() === "") {
        // Tom note: fjern den helt, så objektet ikke fyldes med tomme strenge.
        delete ny[dato];
      } else {
        ny[dato] = tekst;
      }
      return ny;
    });
  }

  // Sletter ALT og starter forfra. NulstilAlt har allerede spurgt to gange,
  // så her gør vi bare rent: alle data tilbage til deres startværdi.
  function nulstilAlt() {
    setVaner(STANDARD_VANER);
    setAfkrydsninger({});
    setIndstillinger({ taerskel: 7, ugeMaal: STANDARD_UGEMAAL });
    setTodos([]);
    setNoter({});
    setVisning("i-dag");
  }

  // De daglige vaner (dem UDEN et uge-mål). Kun de tæller, når vi afgør,
  // hvor høj "grøn dag"-tærsklen må være - ellers ville tærsklen blive
  // uopnåelig på dage, hvor man ikke laver sine uge-vaner.
  const antalDaglige = Math.max(
    1,
    vaner.filter((v) => !v.maalPrUge).length,
  );

  // Sæt tærsklen, men hold den mellem 1 og antallet af daglige vaner.
  function saetTaerskel(ny: number) {
    const holdtIndenfor = Math.max(1, Math.min(ny, antalDaglige));
    setIndstillinger({ ...indstillinger, taerskel: holdtIndenfor });
  }

  // Uge-målet i point. Falder tilbage på standardværdien, indtil engangs-
  // opdateringen ovenfor har gemt et rigtigt tal.
  const ugeMaal = indstillinger.ugeMaal ?? STANDARD_UGEMAAL;

  // Sæt uge-målet. Aldrig under 0 - ellers giver bjælken ikke mening.
  function saetUgeMaal(ny: number) {
    setIndstillinger({ ...indstillinger, ugeMaal: Math.max(0, ny) });
  }

  // Point tjent i denne uge (mandag-søndag) - vises på "Denne uge"-kortet.
  const denneUgesPoint = ugensPoint(vaner, afkrydsninger, dato);

  // Tærsklen vi regner med. Hvis den gemte værdi er blevet for høj (fx fordi
  // vaner er slettet eller lavet om til uge-vaner), klemmer vi den ned, så
  // en grøn dag stadig er mulig.
  const taerskel = Math.max(1, Math.min(indstillinger.taerskel, antalDaglige));

  // Samlede point og level. Point kommer fra to steder:
  // alle vane-afkrydsninger nogensinde + alle færdige to-do opgaver.
  const samledePoint =
    beregnSamledePoint(vaner, afkrydsninger) + beregnOpgavePoint(todos);
  const levelInfo = beregnLevel(samledePoint);
  const titel = findTitel(levelInfo.level);

  // Den samlede dags-streak (grønne dage i træk) + den længste nogensinde.
  // Bruges nu kun af trofæ-tjekkene - selve streaken, brugeren ser, er
  // uge-mål-streaken nedenfor.
  const dagsStreak = samletStreak(vaner, afkrydsninger, dato, taerskel);
  const rekordStreak = laengsteStreak(vaner, afkrydsninger, dato, taerskel);

  // Uge-mål-streaken: uger i træk hvor uge-målet i point er nået.
  // Det er den, der vises øverst og på "Denne uge"-kortet.
  const ugeStreakTal = ugeMaalStreak(vaner, afkrydsninger, ugeMaal, dato);
  const rekordUgeStreak = laengsteUgeMaalStreak(
    vaner,
    afkrydsninger,
    ugeMaal,
    dato,
  );

  // Alt hvad trofæ-tjekkene skal bruge, samlet ét sted.
  const trofaeData: TrofaeData = {
    vaner,
    afkrydsninger,
    todos,
    noter,
    iDag: dato,
    level: levelInfo.level,
    samledePoint,
    streak: dagsStreak.dage,
    rekordStreak,
  };

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
  }, [samledePoint, levelInfo.level]);

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

  // --- Fejring når et nyt trofæ låses op ---
  const opnaaedeTrofae = opnaaedeTrofaeer(trofaeData);
  // Hvilke trofæer var låst op sidst? (Fyldes med det samme, så vi ikke
  // fejrer alle de gamle, første gang appen åbnes.)
  const forrigeTrofaeIder = useRef(
    new Set(opnaaedeTrofae.map((t) => t.id)),
  );
  // Kø af nye trofæer der venter på at blive fejret, + det der vises nu.
  const trofaeKoe = useRef<Trofae[]>([]);
  const [nytTrofae, setNytTrofae] = useState<Trofae | null>(null);

  // Vis det næste trofæ i køen (eller luk, hvis køen er tom).
  function naesteTrofae() {
    setNytTrofae(trofaeKoe.current.shift() ?? null);
  }

  // Opdag nye trofæer. Antallet stiger kun, så vi kan bruge det som signal.
  useEffect(() => {
    const nye = opnaaedeTrofae.filter(
      (t) => !forrigeTrofaeIder.current.has(t.id),
    );
    forrigeTrofaeIder.current = new Set(opnaaedeTrofae.map((t) => t.id));
    if (nye.length === 0) return;

    trofaeKoe.current.push(...nye);
    // Starter der ikke allerede en fejring, tager vi det første i køen.
    if (nytTrofae === null) {
      setNytTrofae(trofaeKoe.current.shift() ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opnaaedeTrofae.length]);

  // Luk trofæ-fejringen af sig selv efter 2,8 sekunder (og gå til næste).
  useEffect(() => {
    if (nytTrofae === null) return;
    const timer = setTimeout(naesteTrofae, 2800);
    return () => clearTimeout(timer);
  }, [nytTrofae]);

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
      {/* "pb-24": plads i bunden, så indholdet ikke gemmer sig bag bund-menuen. */}
      <div className="mx-auto flex max-w-md flex-col gap-5 pb-24">
        <header className="flex items-center gap-3">
          {/* Logo-mærke - samme flueben som app-ikonet på hjemmeskærmen. */}
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-slate-800 ring-1 ring-inset ring-white/5">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#34d399"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m5 13 4.5 4.5L19 7" />
            </svg>
          </span>
          <h1 className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
            QuestLog
          </h1>
        </header>

        {visning === "i-dag" && (
          <>
            {/* Kompakt status-stribe - klæber fast øverst på skærmen, så man
                altid kan se level, streak og dagens fremskridt. Den er også
                anker for det svævende "+X" ved point. */}
            <div className="sticky top-0 z-20">
              <StatusStribe
                titel={titel}
                level={levelInfo.level}
                samledePoint={samledePoint}
                pointTilNaeste={levelInfo.pointTilNaeste}
                ugeStreak={ugeStreakTal}
                denneUgesPoint={denneUgesPoint}
                ugeMaal={ugeMaal}
              />

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

            {/* Vanerne - det man åbner appen for. */}
            <ul className="flex flex-col gap-3">
              {vaner.map((vane) => (
                <VaneKort
                  key={vane.id}
                  vane={vane}
                  gjort={Boolean(dagensAfkrydsninger[vane.id])}
                  streak={vaneStreak(afkrydsninger, vane.id, dato)}
                  dageGjortIAlt={antalDageVaneGjort(afkrydsninger, vane.id)}
                  gjortIUge={gjortIUge(afkrydsninger, vane.id, dato)}
                  ugeStreak={ugeStreak(
                    afkrydsninger,
                    vane.id,
                    vane.maalPrUge ?? 0,
                    dato,
                  )}
                  onSkift={() => skiftVane(vane.id)}
                />
              ))}
            </ul>

            {/* Dagbogs-note til i dag. */}
            <DagNote note={noter[dato] ?? ""} onNote={saetNote} />

            {/* Ugen længere nede - resten står i stribjen øverst. */}
            <StreakBanner
              streak={ugeStreakTal}
              rekord={rekordUgeStreak}
              taerskel={taerskel}
              antalVaner={antalDaglige}
              ugensDage={ugensDage}
              onTaerskel={saetTaerskel}
              ugeMaal={ugeMaal}
              denneUgesPoint={denneUgesPoint}
              onUgeMaal={saetUgeMaal}
            />
          </>
        )}

        {visning === "todo" && (
          <TodoListe todos={todos} setTodos={setTodos} />
        )}

        {visning === "historik" && (
          <Historik
            vaner={vaner}
            afkrydsninger={afkrydsninger}
            noter={noter}
            taerskel={taerskel}
            iDag={dato}
          />
        )}

        {visning === "trofaeer" && <Trofaeer data={trofaeData} />}

        {visning === "rediger" && (
          <>
            <RedigerVaner vaner={vaner} setVaner={setVaner} />
            <Backup />
            <NulstilAlt onNulstil={nulstilAlt} />
          </>
        )}
      </div>

      {/* Fejringen ligger uden for midterspalten, så den kan dække hele skærmen. */}
      <Fejring level={fejrLevel} onLuk={() => setFejrLevel(null)} />

      {/* Fejring når et nyt trofæ låses op. */}
      <TrofaeFejring trofae={nytTrofae} onLuk={naesteTrofae} />

      {/* Bund-menuen: fast i bunden af skærmen. */}
      <BundMenu visning={visning} onVaelg={setVisning} />
    </div>
  );
}
