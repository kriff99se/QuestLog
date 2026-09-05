import type { Vane, Afkrydsninger } from "./types";

// Her regner vi point og level ud. Bemærk: hverken point eller level
// bliver gemt nogen steder. Vi regner dem altid ud fra vanerne og
// afkrydsningerne, så tallene aldrig kan komme i utakt med data.

// Hvor mange point der skal til for at gå ét level op.
// Et rundt tal gør det nemt at regne i hovedet: hver 100 point = nyt level.
export const POINT_PR_LEVEL = 100;

// Læg point sammen for alle afkrydsninger nogensinde.
// For hver dato kigger vi på hver vane: er den krydset af, tæller dens point med.
export function beregnSamledePoint(
  vaner: Vane[],
  afkrydsninger: Afkrydsninger,
): number {
  let sum = 0;

  // Object.values giver os en liste med "dagens afkrydsninger" for hver dato,
  // fx [ { fitness: true }, { laesning: true, kode: true } ].
  for (const dagensAfkrydsninger of Object.values(afkrydsninger)) {
    for (const vane of vaner) {
      // Er denne vane krydset af den dag? Så læg dens point til.
      if (dagensAfkrydsninger[vane.id]) {
        sum += vane.point;
      }
    }
  }

  return sum;
}

// Alt hvad vi vil vise om level, samlet ét sted.
export type LevelInfo = {
  level: number; // hvilket level man er på nu (starter på 1)
  pointIDetteLevel: number; // point tjent siden dette level begyndte
  pointTilNaeste: number; // hvor mange point der mangler til næste level
  procent: number; // hvor fyldt fremskridtsbjælken er, 0-100
};

// Regn level-oplysninger ud fra de samlede point.
export function beregnLevel(samledePoint: number): LevelInfo {
  // Math.floor runder ned. 0-99 point -> level 1, 100-199 -> level 2, osv.
  const level = Math.floor(samledePoint / POINT_PR_LEVEL) + 1;

  // Resten efter division (%) er point tjent inde i det nuværende level.
  const pointIDetteLevel = samledePoint % POINT_PR_LEVEL;

  const pointTilNaeste = POINT_PR_LEVEL - pointIDetteLevel;

  // Da et level er præcis 100 point, er procenten lig med pointIDetteLevel.
  // Vi regner den alligevel ud "rigtigt", så det stadig virker hvis vi
  // senere ændrer POINT_PR_LEVEL.
  const procent = (pointIDetteLevel / POINT_PR_LEVEL) * 100;

  return { level, pointIDetteLevel, pointTilNaeste, procent };
}
