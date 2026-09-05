import type { Vane, Afkrydsninger } from "./types";

// Her regner vi point og level ud. Bemærk: hverken point eller level
// bliver gemt nogen steder. Vi regner dem altid ud fra vanerne og
// afkrydsningerne, så tallene aldrig kan komme i utakt med data.

// Level 1 -> 2 koster BASISPRIS point. Hvert level derefter koster
// TRIN point mere end det forrige (lineær stigning). Med 100 og 10:
// 100, 110, 120, 130 ... Level 100 svarer til ca. 60.000 point i alt.
export const BASISPRIS = 100;
export const TRIN = 10;

// Hvor mange point det koster at gå fra "level" til "level + 1".
export function prisForLevel(level: number): number {
  // level 1 -> 100, level 2 -> 110, level 3 -> 120, osv.
  return BASISPRIS + (level - 1) * TRIN;
}

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
  prisForDetteLevel: number; // hvor mange point hele dette level koster
  pointTilNaeste: number; // hvor mange point der mangler til næste level
  procent: number; // hvor fyldt fremskridtsbjælken er, 0-100
};

// Regn level-oplysninger ud fra de samlede point.
// Fordi prisen stiger for hvert level, kan vi ikke bare dividere.
// I stedet "betaler" vi os op gennem et level ad gangen, så længe
// der er point nok til det næste.
export function beregnLevel(samledePoint: number): LevelInfo {
  let level = 1;
  let pointTilbage = samledePoint;
  let pris = prisForLevel(level);

  // Har vi råd til at rykke et level op? Så træk prisen fra og gør det.
  while (pointTilbage >= pris) {
    pointTilbage -= pris;
    level += 1;
    pris = prisForLevel(level);
  }

  // Det der er tilbage, er point tjent inde i det nuværende level.
  const pointIDetteLevel = pointTilbage;
  const pointTilNaeste = pris - pointTilbage;
  const procent = (pointTilbage / pris) * 100;

  return {
    level,
    pointIDetteLevel,
    prisForDetteLevel: pris,
    pointTilNaeste,
    procent,
  };
}
