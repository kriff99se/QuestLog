// Level-titler. Jo højere level, jo federe titel.
//
// Hver titel har:
//   fraLevel = det laveste level hvor titlen gælder
//   navn     = titlen brugeren ser
//   emoji    = vises altid (virker uden billeder)
//   billede  = valgfrit. En sti til en billedfil i mappen "public/titler/".
//              Fx: billede: "/titler/zyzz.jpg"
//              Læg selv filerne ind i public/titler/ - så vises billedet
//              i stedet for emojien. Brug kun billeder du må bruge.

export type Titel = {
  fraLevel: number;
  navn: string;
  emoji: string;
  billede?: string; // spørgsmålstegnet betyder "må gerne mangle"
};

// Listen skal være sorteret med laveste fraLevel først.
export const TITLER: Titel[] = [
  { fraLevel: 1, navn: "Noob", emoji: "🥚" },
  { fraLevel: 4, navn: "Rookie", emoji: "🐣" },
  { fraLevel: 7, navn: "Grinder", emoji: "⚙️" },
  { fraLevel: 10, navn: "Tryhard", emoji: "😤" },
  { fraLevel: 13, navn: "Beast", emoji: "🦍" },
  { fraLevel: 16, navn: "Gigachad", emoji: "🗿" },
  { fraLevel: 19, navn: "Sigma", emoji: "🐺" },
  { fraLevel: 22, navn: "Zyzz", emoji: "🔱" },
  { fraLevel: 25, navn: "Final Boss", emoji: "👑" },
];

// Find den titel der passer til et level.
// Vi tager den sidste titel i listen, hvis fraLevel er mindre end
// eller lig med vores level.
export function findTitel(level: number): Titel {
  // Start med den første (laveste) titel.
  let fundet = TITLER[0];

  for (const titel of TITLER) {
    if (level >= titel.fraLevel) {
      fundet = titel;
    }
  }

  return fundet;
}
