// Små hjælpefunktioner til datoer.

// Lav en rigtig Date om til tekst i formatet "2026-09-05".
// Vi bruger sådan en tekst som nøgle, når vi gemmer dagens afkrydsninger.
export function tilISO(dato: Date): string {
  const aar = dato.getFullYear();
  // getMonth() tæller fra 0 (januar = 0), så vi lægger 1 til.
  // padStart(2, "0") sikrer to cifre, fx "09" i stedet for "9".
  const maaned = String(dato.getMonth() + 1).padStart(2, "0");
  const dag = String(dato.getDate()).padStart(2, "0");
  return `${aar}-${maaned}-${dag}`;
}

// Dagens dato som "2026-09-05".
export function iDagISO(): string {
  return tilISO(new Date());
}

// Dagens dato plus (eller minus) et antal dage, som "2026-09-05"-tekst.
// 0 = i dag, -1 = i går, 2 = i overmorgen. Bruges af testværktøjet,
// der lader os "rejse i tid" for at afprøve streaks.
export function datoForskudt(antalDage: number): string {
  const d = new Date();
  d.setDate(d.getDate() + antalDage);
  return tilISO(d);
}

// Dagen før en given "2026-09-05"-dato, som ny "2026-09-05"-tekst.
export function dagenFoer(iso: string): string {
  // Del teksten op i tal: "2026-09-05" -> [2026, 9, 5]
  const [aar, maaned, dag] = iso.split("-").map(Number);
  // Måned er 0-baseret i Date, så vi trækker 1 fra. "dag - 1" er dagen før -
  // Date retter selv efter, hvis vi fx ryger fra den 1. til sidste dag i forrige måned.
  const d = new Date(aar, maaned - 1, dag - 1);
  return tilISO(d);
}

// De 7 datoer i den uge, som en given dato ligger i - mandag til søndag.
// Bruges til uge-sporet i streak-kortet.
export function ugensDatoer(iso: string): string[] {
  const [aar, maaned, dag] = iso.split("-").map(Number);
  const d = new Date(aar, maaned - 1, dag);
  // getDay(): søndag = 0, mandag = 1 ... lørdag = 6.
  // Vi vil have mandag som ugens første dag, så vi regner den om:
  // mandag = 0, tirsdag = 1 ... søndag = 6.
  const ugedag = (d.getDay() + 6) % 7;

  const datoer: string[] = [];
  for (let i = 0; i < 7; i++) {
    // Start på mandag (dag - ugedag) og gå frem dag for dag.
    const dagIUgen = new Date(aar, maaned - 1, dag - ugedag + i);
    datoer.push(tilISO(dagIUgen));
  }
  return datoer;
}

// Kort ugedag for en dato, fx "ma", "ti", "on".
export function ugedagKort(iso: string): string {
  const [aar, maaned, dag] = iso.split("-").map(Number);
  const tekst = new Date(aar, maaned - 1, dag).toLocaleDateString("da-DK", {
    weekday: "short",
  });
  // da-DK giver fx "man." - vi fjerner punktummet og tager de to første bogstaver.
  return tekst.replace(".", "").slice(0, 2);
}

// En "2026-09-05"-dato skrevet pænt på dansk,
// fx "fredag den 5. september 2026".
export function datoLang(iso: string): string {
  const [aar, maaned, dag] = iso.split("-").map(Number);
  return new Date(aar, maaned - 1, dag).toLocaleDateString("da-DK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
