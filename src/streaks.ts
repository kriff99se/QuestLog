import type { Vane, Afkrydsninger } from "./types";
import { dagenFoer } from "./datoer";

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

// Den samlede dags-streak: antal grønne dage i træk.
//
// Regel: "i dag" tæller kun med, hvis dagen allerede er grøn. Ellers starter
// vi tællingen i går, så streaken ikke står på 0 hver morgen, før man
// har nået at krydse nok af.
export function samletStreak(
  vaner: Vane[],
  afkrydsninger: Afkrydsninger,
  iDag: string,
  taerskel: number,
): number {
  let dato = iDag;

  // Er i dag ikke grøn endnu? Så begynder vi at kigge fra i går.
  if (!erGroenDag(vaner, afkrydsninger, dato, taerskel)) {
    dato = dagenFoer(dato);
  }

  // Gå baglæns, én dag ad gangen, så længe dagen er grøn.
  let streak = 0;
  while (erGroenDag(vaner, afkrydsninger, dato, taerskel)) {
    streak += 1;
    dato = dagenFoer(dato);
  }
  return streak;
}

// Streak for én enkelt vane: antal dage i træk lige den vane er holdt.
// Samme regel om "i dag" som ovenfor.
export function vaneStreak(
  afkrydsninger: Afkrydsninger,
  vaneId: string,
  iDag: string,
): number {
  // Lille hjælper: var denne vane krydset af på en bestemt dato?
  function holdt(dato: string): boolean {
    const dagen = afkrydsninger[dato] ?? {};
    return Boolean(dagen[vaneId]);
  }

  let dato = iDag;
  if (!holdt(dato)) {
    dato = dagenFoer(dato);
  }

  let streak = 0;
  while (holdt(dato)) {
    streak += 1;
    dato = dagenFoer(dato);
  }
  return streak;
}
