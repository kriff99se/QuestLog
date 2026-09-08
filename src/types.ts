// Her samler vi de "former" på data, som appen bruger.
// En type beskriver, hvordan et objekt skal se ud.

// En enkelt vane.
export type Vane = {
  id: string; // kort, fast tekst vi bruger til at kende vanen, fx "fitness"
  navn: string; // det brugeren læser, fx "Fitness"
  ikon: string; // en emoji, fx "🏋️"
  point: number; // hvor mange point vanen giver om dagen
  // Valgfrit: kroner sparet for hver dag vanen holdes. Bruges fx til
  // "Ingen snus" (60 kr/dag). Er den ikke sat (eller 0), vises der ingen
  // pengeoplysning på kortet.
  sparerPrDag?: number;
  // Valgfrit: hvor mange gange om ugen vanen skal gøres. Er den ikke sat
  // (eller 0), er vanen en helt almindelig DAGLIG vane. Er den fx sat til 4,
  // bliver vanen en "uge-vane": kortet viser "3 / 4 i denne uge" i stedet for
  // en dags-streak, og 🔥-tallet tæller uger i træk, hvor målet er ramt.
  maalPrUge?: number;
};

// Alle afkrydsninger, opdelt efter dato.
// Eksempel:
// {
//   "2026-09-05": { fitness: true, laesning: true },
//   "2026-09-06": { fitness: true }
// }
export type Afkrydsninger = {
  [dato: string]: {
    [vaneId: string]: boolean;
  };
};

// En enkelt to-do (opgave på huskelisten).
export type Todo = {
  id: string; // fast tekst vi kender opgaven på, fx "todo-1788630943107"
  tekst: string; // det brugeren skrev, fx "Køb mælk"
  faerdig: boolean; // er opgaven krydset af som klaret?
};

// Appens indstillinger.
export type Indstillinger = {
  // Hvor mange vaner der skal krydses af på en dag,
  // før dagen tæller som en "grøn dag" i streaken.
  taerskel: number;
};
