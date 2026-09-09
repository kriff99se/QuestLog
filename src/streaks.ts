import type { Vane, Afkrydsninger } from "./types";
import {
  dagenFoer,
  dagenEfter,
  ugensDatoer,
  forrigeUgesMandag,
} from "./datoer";
import { ugensPoint } from "./point";

// Her regner vi streaks ud. Ligesom point og level bliver de aldrig gemt -
// de beregnes altid ud fra afkrydsningerne, så de ikke kan komme i utakt.

// Hvor mange vaner er krydset af en bestemt dag?
export function antalGjortPaaDato(
  vaner: Vane[],
  afkrydsninger: Afkrydsninger,
  dato: string,
): number {
  const dagen = afkrydsninger[dato] ?? {};
  return vaner.filter((vane) => dagen[vane.id]).length;
}

// Hvor mange dage i alt (nogensinde) er en bestemt vane krydset af?
// Bruges til at regne den samlede besparelse ud på fx "Ingen snus".
export function antalDageVaneGjort(
  afkrydsninger: Afkrydsninger,
  vaneId: string,
): number {
  // Object.values giver os ét objekt pr. dato, fx { fitness: true }.
  return Object.values(afkrydsninger).filter((dag) => dag[vaneId]).length;
}

// En "grøn dag" = mindst 'taerskel' vaner krydset af den dag.
export function erGroenDag(
  vaner: Vane[],
  afkrydsninger: Afkrydsninger,
  dato: string,
  taerskel: number,
): boolean {
  return antalGjortPaaDato(vaner, afkrydsninger, dato) >= taerskel;
}

// --- Streaks med ét "skjold" ---
//
// Reglerne for en streak:
// - "I dag" tæller kun med, hvis dagen allerede er grøn. Ellers starter vi
//   tællingen i går, så streaken ikke står på 0 hver morgen.
// - Streaken tåler ÉN misset dag undervejs ("skjoldet"). Den dag tæller
//   ikke med i tallet, men den nulstiller heller ikke streaken. Misser man
//   to dage - eller en dag mere efter skjoldet er brugt - er streaken slut.
//
// Det gør, at en enkelt dårlig dag ikke sender én tilbage til nul, hvilket
// er dét, der får folk til at give op ("nu er den alligevel ødelagt").

type StreakInfo = {
  dage: number; // antal grønne dage i den nuværende streak
  skjoldBrugt: boolean; // reddede streaken en misset dag?
};

// Går baglæns fra en startdato og tæller "gode" dage, mens den tillader
// én misset dag. "erGod" fortæller, om en bestemt dato talte som god.
function taelBaglaens(
  start: string,
  erGod: (dato: string) => boolean,
): StreakInfo {
  let dato = start;

  // Er startdagen ikke god endnu? Så begynder vi i går (i dag er "i gang").
  if (!erGod(dato)) dato = dagenFoer(dato);

  let dage = 0;
  let skjoldBrugt = false;
  let groenneEfterSkjold = 0; // grønne dage ældre end det bridgede hul

  while (true) {
    if (erGod(dato)) {
      dage += 1;
      if (skjoldBrugt) groenneEfterSkjold += 1;
    } else if (!skjoldBrugt) {
      // Første missede dag: brug skjoldet og fortsæt.
      skjoldBrugt = true;
    } else {
      // Anden missede dag: streaken er slut.
      break;
    }
    dato = dagenFoer(dato);
  }

  // Skjoldet "reddede" kun noget rigtigt, hvis hullet lå MIDT i streaken -
  // altså grønne dage på begge sider af det. Ellers var det bare den tomme
  // tid før streaken begyndte, og så skal vi ikke sige noget.
  const skjoldReddede =
    skjoldBrugt && groenneEfterSkjold > 0 && dage > groenneEfterSkjold;

  return { dage, skjoldBrugt: skjoldReddede };
}

// Den samlede dags-streak (grønne dage i træk, med ét skjold).
export function samletStreak(
  vaner: Vane[],
  afkrydsninger: Afkrydsninger,
  iDag: string,
  taerskel: number,
): StreakInfo {
  return taelBaglaens(iDag, (dato) =>
    erGroenDag(vaner, afkrydsninger, dato, taerskel),
  );
}

// Streak for én enkelt vane: dage i træk vanen er holdt (med ét skjold).
export function vaneStreak(
  afkrydsninger: Afkrydsninger,
  vaneId: string,
  iDag: string,
): number {
  const info = taelBaglaens(iDag, (dato) =>
    Boolean((afkrydsninger[dato] ?? {})[vaneId]),
  );
  return info.dage;
}

// --- Uge-vaner ---
//
// Nogle vaner skal ikke gøres hver dag, men fx 4 gange om ugen. For dem
// giver en dags-streak ikke mening. I stedet regner vi:
//  - hvor mange gange vanen er gjort i denne (eller en given) uge, og
//  - hvor mange uger i træk målet er ramt ("uge-streak").
// En uge går fra mandag til søndag (samme som uge-sporet på streak-kortet).

// Hvor mange dage i ugen omkring 'datoIUgen' er vanen krydset af?
export function gjortIUge(
  afkrydsninger: Afkrydsninger,
  vaneId: string,
  datoIUgen: string,
): number {
  return ugensDatoer(datoIUgen).filter(
    (d) => (afkrydsninger[d] ?? {})[vaneId],
  ).length;
}

// Uger i træk hvor vanen er gjort mindst 'maal' gange.
// Ligesom dags-streaken: den nuværende uge tæller kun med, hvis målet
// allerede ER ramt. Er det ikke (ugen er "i gang"), starter vi tællingen
// i sidste uge, så tallet ikke falder til 0 hver mandag morgen.
export function ugeStreak(
  afkrydsninger: Afkrydsninger,
  vaneId: string,
  maal: number,
  iDag: string,
): number {
  if (maal <= 0) return 0;

  let mandag = ugensDatoer(iDag)[0];

  // Denne uge ikke i mål endnu? Så begynder vi i ugen før.
  if (gjortIUge(afkrydsninger, vaneId, mandag) < maal) {
    mandag = forrigeUgesMandag(mandag);
  }

  let uger = 0;
  while (gjortIUge(afkrydsninger, vaneId, mandag) >= maal) {
    uger += 1;
    mandag = forrigeUgesMandag(mandag);
  }
  return uger;
}

// Den længste uge-streak nogensinde for en uge-vane - et "rekord",
// der aldrig kan mistes. Vi går alle uger igennem fra den første
// registrerede afkrydsning og frem til i dag.
export function laengsteUgeStreak(
  afkrydsninger: Afkrydsninger,
  vaneId: string,
  maal: number,
  iDag: string,
): number {
  if (maal <= 0) return 0;

  const datoer = Object.keys(afkrydsninger).sort();
  if (datoer.length === 0) return 0;

  let mandag = ugensDatoer(datoer[0])[0];
  const sisteMandag = ugensDatoer(iDag)[0];

  let bedste = 0;
  let stribe = 0;
  while (mandag <= sisteMandag) {
    if (gjortIUge(afkrydsninger, vaneId, mandag) >= maal) {
      stribe += 1;
      if (stribe > bedste) bedste = stribe;
    } else {
      stribe = 0;
    }
    // Gå til mandagen i ugen efter.
    mandag = ugensDatoer(dagenEfter(ugensDatoer(mandag)[6]))[0];
  }
  return bedste;
}

// --- Uge-mål-streak (point pr. uge) ---
//
// Dette er streaken for HELE ugen, ikke for én vane: hvor mange uger i
// træk har du tjent mindst 'ugeMaal' point (mandag-søndag)? En produktiv
// dag fylder en stor bid af ugen, så en stille dag bagefter ikke koster
// noget. Samme "denne uge er i gang"-regel som de andre streaks, men
// intet skjold - en uge er allerede en rummelig enhed.

// Uger i træk hvor du har nået uge-målet i point.
export function ugeMaalStreak(
  vaner: Vane[],
  afkrydsninger: Afkrydsninger,
  ugeMaal: number,
  iDag: string,
): number {
  if (ugeMaal <= 0) return 0;

  let mandag = ugensDatoer(iDag)[0];

  // Denne uge ikke i mål endnu? Så begynder vi i ugen før.
  if (ugensPoint(vaner, afkrydsninger, mandag) < ugeMaal) {
    mandag = forrigeUgesMandag(mandag);
  }

  let uger = 0;
  while (ugensPoint(vaner, afkrydsninger, mandag) >= ugeMaal) {
    uger += 1;
    mandag = forrigeUgesMandag(mandag);
  }
  return uger;
}

// Den længste uge-mål-streak nogensinde - et rekord, der aldrig kan mistes.
export function laengsteUgeMaalStreak(
  vaner: Vane[],
  afkrydsninger: Afkrydsninger,
  ugeMaal: number,
  iDag: string,
): number {
  if (ugeMaal <= 0) return 0;

  const datoer = Object.keys(afkrydsninger).sort();
  if (datoer.length === 0) return 0;

  let mandag = ugensDatoer(datoer[0])[0];
  const sisteMandag = ugensDatoer(iDag)[0];

  let bedste = 0;
  let stribe = 0;
  while (mandag <= sisteMandag) {
    if (ugensPoint(vaner, afkrydsninger, mandag) >= ugeMaal) {
      stribe += 1;
      if (stribe > bedste) bedste = stribe;
    } else {
      stribe = 0;
    }
    // Gå til mandagen i ugen efter.
    mandag = ugensDatoer(dagenEfter(ugensDatoer(mandag)[6]))[0];
  }
  return bedste;
}

// "Du er tæt på"-tekst til uge-målet: enten hvor få point der mangler,
// eller hvor få uger der er til næste stime-milepæl.
const UGE_MILEPAELE = [2, 4, 8, 13, 26, 52];

export function naesteUgeMaal(
  denneUgesPoint: number,
  ugeMaal: number,
  ugeStreak: number,
): string {
  if (ugeMaal > 0 && denneUgesPoint < ugeMaal) {
    const mangler = ugeMaal - denneUgesPoint;
    return `${mangler} point til uge-målet`;
  }
  const naeste =
    UGE_MILEPAELE.find((m) => m > ugeStreak) ??
    Math.ceil((ugeStreak + 1) / 26) * 26;
  const til = naeste - ugeStreak;
  return `${til} ${til === 1 ? "uge" : "uger"} til en ${naeste}-ugers stime`;
}

// Runde streak-tal, det er sjovt at ramme.
const MILEPAELE = [3, 7, 14, 30, 60, 100, 200, 365];

// Én kort "du er tæt på"-tekst: enten hvor lidt der mangler til en grøn dag,
// eller hvor få dage der er til den næste streak-milepæl. Udnytter at
// motivationen stiger, jo tættere man er på et mål.
export function naesteMaal(
  streak: number,
  gjortIDag: number,
  taerskel: number,
): string {
  if (gjortIDag < taerskel) {
    const mangler = taerskel - gjortIDag;
    return `Kun ${mangler} ${mangler === 1 ? "vane" : "vaner"} til en grøn dag i dag`;
  }
  // Næste runde tal over den nuværende streak (eller næste hundrede).
  const naeste =
    MILEPAELE.find((m) => m > streak) ?? Math.ceil((streak + 1) / 100) * 100;
  const til = naeste - streak;
  return `${til} ${til === 1 ? "dag" : "dage"} til en ${naeste}-dages streak`;
}

// Går hele historikken igennem (fra første registrerede dag til i dag) og
// finder den længste stime af "gode" dage, med samme skjold-regel som de
// andre streaks. "erGod" fortæller, om en bestemt dato var god.
function laengsteRun(
  afkrydsninger: Afkrydsninger,
  iDag: string,
  erGod: (dato: string) => boolean,
): number {
  const datoer = Object.keys(afkrydsninger).sort();
  if (datoer.length === 0) return 0;

  let bedste = 0;
  let dage = 0;
  let skjoldBrugt = false;

  // "YYYY-MM-DD" kan sammenlignes direkte som tekst.
  for (let dato = datoer[0]; dato <= iDag; dato = dagenEfter(dato)) {
    if (erGod(dato)) {
      dage += 1;
    } else if (!skjoldBrugt) {
      skjoldBrugt = true; // brug skjoldet, stimen fortsætter
    } else {
      // To missede dage: denne stime er slut - gem den og start forfra.
      if (dage > bedste) bedste = dage;
      dage = 0;
      skjoldBrugt = false;
    }
  }
  return Math.max(bedste, dage);
}

// Den længste samlede dags-streak nogensinde - et "personligt rekord",
// der aldrig kan mistes.
export function laengsteStreak(
  vaner: Vane[],
  afkrydsninger: Afkrydsninger,
  iDag: string,
  taerskel: number,
): number {
  return laengsteRun(afkrydsninger, iDag, (dato) =>
    erGroenDag(vaner, afkrydsninger, dato, taerskel),
  );
}

// Den længste stime for én enkelt vane nogensinde.
export function laengsteVaneStreak(
  afkrydsninger: Afkrydsninger,
  vaneId: string,
  iDag: string,
): number {
  return laengsteRun(afkrydsninger, iDag, (dato) =>
    Boolean((afkrydsninger[dato] ?? {})[vaneId]),
  );
}
