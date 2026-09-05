import type { Vane } from "./types";

// De 10 standardvaner. Nemme vaner giver færrest point, svære giver flest.
// Denne liste bruges kun første gang appen åbnes - derefter ligger vanerne
// i localStorage, og fra Fase 3 kan de redigeres i appen.
export const STANDARD_VANER: Vane[] = [
  { id: "ryd-op", navn: "Rydde op 10 minutter", ikon: "🧹", point: 5 },
  { id: "laesning", navn: "Læsning", ikon: "📚", point: 10 },
  { id: "skridt", navn: "10.000 skridt", ikon: "👟", point: 15 },
  { id: "soevn", navn: "8 timers søvn", ikon: "😴", point: 15 },
  { id: "ingen-skaerm", navn: "Ingen skærm 30 min før sengetid", ikon: "🌙", point: 15 },
  { id: "kode", navn: "Kode 30 minutter", ikon: "💻", point: 15 },
  { id: "sauna", navn: "Sauna", ikon: "🧖", point: 15 },
  { id: "kost", navn: "Sund kost", ikon: "🥗", point: 20 },
  { id: "fitness", navn: "Fitness", ikon: "🏋️", point: 25 },
  { id: "ingen-snus", navn: "Ingen snus", ikon: "🚭", point: 25 },
];
