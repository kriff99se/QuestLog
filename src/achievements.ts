import type { Vane, Afkrydsninger, Todo } from "./types";
import { antalDageVaneGjort, antalGjortPaaDato } from "./streaks";

// --- Trofæer / achievements ---
//
// Et trofæ låses op, når en betingelse er opfyldt. Vi GEMMER ikke "låst op" -
// vi regner det altid ud fra data (ligesom point og streaks), så det ikke kan
// komme i utakt. Hvert trofæ har en "værdi" i point; summen af de opnåede
// værdier er din samlede trofæ-score.

// Alt hvad et trofæ-tjek har brug for. App'en har allerede regnet det meste ud.
export type TrofaeData = {
  vaner: Vane[];
  afkrydsninger: Afkrydsninger;
  todos: Todo[];
  noter: Record<string, string>;
  iDag: string;
  level: number; // nuværende level (fra vane- + opgave-point)
  samledePoint: number; // vane- + opgave-point i alt
  streak: number; // nuværende uge-mål-streak (uger i træk uge-målet er nået)
  rekordStreak: number; // længste uge-mål-streak nogensinde
};

export type Trofae = {
  id: string;
  navn: string;
  beskrivelse: string;
  ikon: string;
  tier: "bronze" | "sølv" | "guld" | "platin" | "legendarisk";
  vaerdi: number; // trofæ-point man får for at låse det op
  opnaaet: (d: TrofaeData) => boolean;
};

// --- Små hjælpere til tællinger på tværs af hele historikken ---

// Hvor mange gange i alt er en vane blevet krydset af (uanset hvilken)?
function afkrydsningerIAlt(afkrydsninger: Afkrydsninger): number {
  let sum = 0;
  for (const dag of Object.values(afkrydsninger)) {
    sum += Object.values(dag).filter(Boolean).length;
  }
  return sum;
}

// Hvor mange "perfekte" dage har der været (alle DAGLIGE vaner krydset af)?
// Uge-vaner tælles ikke med her - ellers ville en perfekt dag være umulig
// på dage, hvor man ikke skal lave sine uge-vaner.
function perfekteDage(vaner: Vane[], afkrydsninger: Afkrydsninger): number {
  const daglige = vaner.filter((v) => !v.maalPrUge);
  if (daglige.length === 0) return 0;
  return Object.keys(afkrydsninger).filter(
    (dato) => antalGjortPaaDato(daglige, afkrydsninger, dato) === daglige.length,
  ).length;
}

// Samlet besparelse i kroner fra alle vaner med et "sparer kr/dag"-beløb.
function samletBesparelse(vaner: Vane[], afkrydsninger: Afkrydsninger): number {
  let sum = 0;
  for (const vane of vaner) {
    if (vane.sparerPrDag && vane.sparerPrDag > 0) {
      sum += vane.sparerPrDag * antalDageVaneGjort(afkrydsninger, vane.id);
    }
  }
  return sum;
}

// Værdi pr. tier - så listen er nem at holde konsekvent.
const V = {
  bronze: 20,
  sølv: 75,
  guld: 300,
  platin: 1000,
  legendarisk: 5000,
} as const;

// Lille genvej til at lave et "nå X"-trofæ.
function maal(
  id: string,
  ikon: string,
  navn: string,
  beskrivelse: string,
  tier: Trofae["tier"],
  opnaaet: (d: TrofaeData) => boolean,
): Trofae {
  return { id, ikon, navn, beskrivelse, tier, vaerdi: V[tier], opnaaet };
}

// --- Selve listen ---
// Cirka i rækkefølge fra let til svær, så man kan se "hvad er det næste".
export const TROFAEER: Trofae[] = [
  // Uge-mål-streaks (uger i træk hvor uge-målet i point er nået)
  maal("uge-streak-1", "🌱", "Første grønne uge", "Nå uge-målet én uge", "bronze", (d) => d.rekordStreak >= 1),
  maal("uge-streak-2", "🔥", "Godt i gang", "2 grønne uger i træk", "bronze", (d) => d.rekordStreak >= 2),
  maal("uge-streak-4", "📅", "En måned", "4 grønne uger i træk", "sølv", (d) => d.rekordStreak >= 4),
  maal("uge-streak-8", "💪", "To måneder", "8 grønne uger i træk", "sølv", (d) => d.rekordStreak >= 8),
  maal("uge-streak-13", "🗓️", "Et kvartal", "13 grønne uger i træk", "guld", (d) => d.rekordStreak >= 13),
  maal("uge-streak-26", "⛰️", "Et halvt år", "26 grønne uger i træk", "guld", (d) => d.rekordStreak >= 26),
  maal("uge-streak-52", "👑", "Et helt år", "52 grønne uger i træk", "platin", (d) => d.rekordStreak >= 52),
  maal("uge-streak-104", "🏆", "To år i træk", "104 grønne uger i træk", "legendarisk", (d) => d.rekordStreak >= 104),

  // Levels
  maal("level-2", "🐣", "Level 2", "Nå level 2", "bronze", (d) => d.level >= 2),
  maal("level-5", "⭐", "Level 5", "Nå level 5", "bronze", (d) => d.level >= 5),
  maal("level-10", "🌟", "Level 10", "Nå level 10", "sølv", (d) => d.level >= 10),
  maal("level-25", "✨", "Level 25", "Nå level 25", "guld", (d) => d.level >= 25),
  maal("level-50", "🏅", "Level 50", "Nå level 50", "platin", (d) => d.level >= 50),
  maal("level-75", "🎖️", "Level 75", "Nå level 75", "platin", (d) => d.level >= 75),
  maal("level-100", "🐐", "GOAT", "Nå level 100", "legendarisk", (d) => d.level >= 100),

  // Point i alt
  maal("point-1000", "🎯", "1.000 point", "Tjen 1.000 point i alt", "bronze", (d) => d.samledePoint >= 1000),
  maal("point-5000", "🎯", "5.000 point", "Tjen 5.000 point i alt", "sølv", (d) => d.samledePoint >= 5000),
  maal("point-10000", "🎯", "10.000 point", "Tjen 10.000 point i alt", "guld", (d) => d.samledePoint >= 10000),
  maal("point-25000", "🎯", "25.000 point", "Tjen 25.000 point i alt", "platin", (d) => d.samledePoint >= 25000),
  maal("point-50000", "🎯", "50.000 point", "Tjen 50.000 point i alt", "legendarisk", (d) => d.samledePoint >= 50000),

  // Afkrydsninger i alt
  maal("checks-25", "✅", "25 afkrydsninger", "Kryds 25 vaner af i alt", "bronze", (d) => afkrydsningerIAlt(d.afkrydsninger) >= 25),
  maal("checks-100", "✅", "100 afkrydsninger", "Kryds 100 vaner af i alt", "sølv", (d) => afkrydsningerIAlt(d.afkrydsninger) >= 100),
  maal("checks-500", "✅", "500 afkrydsninger", "Kryds 500 vaner af i alt", "guld", (d) => afkrydsningerIAlt(d.afkrydsninger) >= 500),
  maal("checks-1000", "✅", "1.000 afkrydsninger", "Kryds 1.000 vaner af i alt", "platin", (d) => afkrydsningerIAlt(d.afkrydsninger) >= 1000),
  maal("checks-2500", "✅", "2.500 afkrydsninger", "Kryds 2.500 vaner af i alt", "legendarisk", (d) => afkrydsningerIAlt(d.afkrydsninger) >= 2500),

  // Perfekte dage (alle vaner)
  maal("perfekt-1", "🌈", "Perfekt dag", "Kryds ALLE vaner af på én dag", "sølv", (d) => perfekteDage(d.vaner, d.afkrydsninger) >= 1),
  maal("perfekt-5", "🌈", "5 perfekte dage", "5 dage hvor alle vaner blev klaret", "guld", (d) => perfekteDage(d.vaner, d.afkrydsninger) >= 5),
  maal("perfekt-25", "🌈", "25 perfekte dage", "25 dage hvor alle vaner blev klaret", "platin", (d) => perfekteDage(d.vaner, d.afkrydsninger) >= 25),

  // Penge sparet
  maal("penge-500", "💰", "500 kr sparet", "Spar 500 kr på undgå-vaner", "bronze", (d) => samletBesparelse(d.vaner, d.afkrydsninger) >= 500),
  maal("penge-1000", "💰", "1.000 kr sparet", "Spar 1.000 kr på undgå-vaner", "sølv", (d) => samletBesparelse(d.vaner, d.afkrydsninger) >= 1000),
  maal("penge-5000", "💰", "5.000 kr sparet", "Spar 5.000 kr på undgå-vaner", "guld", (d) => samletBesparelse(d.vaner, d.afkrydsninger) >= 5000),
  maal("penge-10000", "💰", "10.000 kr sparet", "Spar 10.000 kr på undgå-vaner", "platin", (d) => samletBesparelse(d.vaner, d.afkrydsninger) >= 10000),
  maal("penge-25000", "💰", "25.000 kr sparet", "Spar 25.000 kr på undgå-vaner", "legendarisk", (d) => samletBesparelse(d.vaner, d.afkrydsninger) >= 25000),

  // Noter
  maal("note-1", "📝", "Første note", "Skriv en dagbogs-note", "bronze", (d) => Object.keys(d.noter).length >= 1),
  maal("note-7", "📝", "En uges noter", "Skriv noter på 7 dage", "sølv", (d) => Object.keys(d.noter).length >= 7),
  maal("note-30", "📓", "30 noter", "Skriv noter på 30 dage", "guld", (d) => Object.keys(d.noter).length >= 30),

  // To-do
  maal("todo-10", "📋", "10 opgaver klaret", "Marker 10 opgaver som klaret", "bronze", (d) => d.todos.filter((t) => t.faerdig).length >= 10),
  maal("todo-50", "📋", "50 opgaver klaret", "Marker 50 opgaver som klaret", "guld", (d) => d.todos.filter((t) => t.faerdig).length >= 50),

  // Diverse
  maal("alle-proevet", "🧭", "Prøvet alt", "Kryds hver vane af mindst én gang", "sølv", (d) =>
    d.vaner.length > 0 &&
    d.vaner.every((v) => antalDageVaneGjort(d.afkrydsninger, v.id) > 0),
  ),
  maal("comeback", "🔄", "Comeback", "Tilbage på 3+ grønne uger efter en længere stime", "guld", (d) => d.streak >= 3 && d.rekordStreak > d.streak),
];

// Alle trofæer man har låst op lige nu.
export function opnaaedeTrofaeer(d: TrofaeData): Trofae[] {
  return TROFAEER.filter((t) => t.opnaaet(d));
}

// Den samlede trofæ-score = summen af værdierne på de opnåede trofæer.
export function trofaeScore(d: TrofaeData): number {
  return opnaaedeTrofaeer(d).reduce((sum, t) => sum + t.vaerdi, 0);
}
