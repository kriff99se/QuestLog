import type { Vane, Afkrydsninger } from "./types";

// Her regner vi point og level ud. Bemærk: hverken point eller level
// bliver gemt nogen steder. Vi regner dem altid ud fra vanerne og
// afkrydsningerne, så tallene aldrig kan komme i utakt med data.

// Level 1 -> 2 koster BASISPRIS point. Hvert level derefter koster
// FAKTOR gange så meget som det forrige. Med 100 og 1,5 bliver det:
// 100, 150, 230, 340, 510 ... (afrundet til nærmeste 10).
export const BASISPRIS = 100;
export const FAKTOR = 1.5;

// Hvor mange point det koster at gå fra "level" til "level + 1".
export function prisForLevel(level: number): number {
  // Math.pow(1.5, n) betyder "1,5 ganget med sig selv n gange".
  // level 1 -> 1,5^0 = 1, level 2 -> 1,5^1 = 1,5, osv.
  const raaPris = BASISPRIS * Math.pow(FAKTOR, level - 1);

  // Rund til nærmeste 10, så tallene er pæne at se på.
  return Math.round(raaPris / 10) * 10;
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
