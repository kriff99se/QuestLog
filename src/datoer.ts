// Små hjælpefunktioner til datoer.

// Dagens dato som tekst i formatet "2026-09-05".
// Vi bruger den som nøgle, når vi gemmer dagens afkrydsninger.
export function iDagISO(): string {
  const nu = new Date();
  const aar = nu.getFullYear();
  // getMonth() tæller fra 0 (januar = 0), så vi lægger 1 til.
  // padStart(2, "0") sikrer to cifre, fx "09" i stedet for "9".
  const maaned = String(nu.getMonth() + 1).padStart(2, "0");
  const dag = String(nu.getDate()).padStart(2, "0");
  return `${aar}-${maaned}-${dag}`;
}

// Dagens dato skrevet pænt på dansk, fx "fredag den 5. september 2026".
export function iDagLang(): string {
  return new Date().toLocaleDateString("da-DK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
