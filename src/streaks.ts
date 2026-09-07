import type { Vane, Afkrydsninger } from "./types";
import { dagenFoer, dagenEfter } from "./datoer";

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

// Den længste samlede streak nogensinde - et "personligt rekord", der
// aldrig kan mistes. Regnes ud ved at gå historikken igennem fra den
// første registrerede dag og frem til i dag, med samme skjold-regel.
export function laengsteStreak(
  vaner: Vane[],
  afkrydsninger: Afkrydsninger,
  iDag: string,
  taerskel: number,
): number {
  const datoer = Object.keys(afkrydsninger).sort();
  if (datoer.length === 0) return 0;

  let bedste = 0;
  let dage = 0;
  let skjoldBrugt = false;

  // "YYYY-MM-DD" kan sammenlignes direkte som tekst.
  for (let dato = datoer[0]; dato <= iDag; dato = dagenEfter(dato)) {
    if (erGroenDag(vaner, afkrydsninger, dato, taerskel)) {
      dage += 1;
    } else if (!skjoldBrugt) {
      skjoldBrugt = true; // brug skjoldet, streaken fortsætter
    } else {
      // To missede dage: denne streak er slut - gem den og start forfra.
      if (dage > bedste) bedste = dage;
      dage = 0;
      skjoldBrugt = false;
    }
  }
  if (dage > bedste) bedste = dage;
  return bedste;
}
