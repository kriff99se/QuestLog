// Her samler vi de "former" på data, som appen bruger.
// En type beskriver, hvordan et objekt skal se ud.

// En enkelt vane.
export type Vane = {
  id: string; // kort, fast tekst vi bruger til at kende vanen, fx "fitness"
  navn: string; // det brugeren læser, fx "Fitness"
  ikon: string; // en emoji, fx "🏋️"
  point: number; // hvor mange point vanen giver om dagen
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

// Appens indstillinger.
export type Indstillinger = {
  // Hvor mange vaner der skal krydses af på en dag,
  // før dagen tæller som en "grøn dag" i streaken.
  taerskel: number;
};
