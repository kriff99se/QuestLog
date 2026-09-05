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
// Der er en ny titel ca. hvert 4. level, hele vejen op til level 100.
export const TITLER: Titel[] = [
  { fraLevel: 1, navn: "Noob", emoji: "🥚" },
  { fraLevel: 5, navn: "Rookie", emoji: "🐣" },
  { fraLevel: 9, navn: "Grinder", emoji: "⚙️" },
  { fraLevel: 13, navn: "Tryhard", emoji: "😤" },
  { fraLevel: 17, navn: "Sweatlord", emoji: "💦" },
  { fraLevel: 21, navn: "Gym Rat", emoji: "🐀" },
  { fraLevel: 25, navn: "Swole Bro", emoji: "🤝" },
  { fraLevel: 29, navn: "Beast", emoji: "🦍" },
  { fraLevel: 33, navn: "Alpha Wolf", emoji: "🐺" },
  { fraLevel: 37, navn: "Chad", emoji: "🗿" },
  { fraLevel: 41, navn: "Gigachad", emoji: "🧱" },
  { fraLevel: 45, navn: "Sigma", emoji: "🥶" },
  { fraLevel: 49, navn: "Grindset Guru", emoji: "🧠" },
  { fraLevel: 53, navn: "Mewing Master", emoji: "😐" },
  { fraLevel: 57, navn: "Looksmaxxer", emoji: "📐" },
  { fraLevel: 61, navn: "Aura Farmer", emoji: "🌾" },
  { fraLevel: 65, navn: "Certified Menace", emoji: "😈" },
  { fraLevel: 69, navn: "NPC Slayer", emoji: "🎮" },
  { fraLevel: 73, navn: "Touch-Grass Denier", emoji: "🌿" },
  { fraLevel: 77, navn: "Final Form", emoji: "🔥" },
  { fraLevel: 81, navn: "Ascended", emoji: "🕊️" },
  { fraLevel: 85, navn: "Mythic Beast", emoji: "🐉" },
  { fraLevel: 89, navn: "Demigod", emoji: "⚡" },
  { fraLevel: 93, navn: "Zyzz", emoji: "🔱" },
  { fraLevel: 97, navn: "GOAT", emoji: "🐐" },
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
