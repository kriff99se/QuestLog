import { useState, useEffect } from "react";

// En genbrugelig "hook". Den virker som Reacts useState,
// men gemmer også værdien i browserens localStorage,
// så den huskes efter en genindlæsning af siden.
//
// noegle      = navnet data gemmes under i localStorage
// startvaerdi = hvad vi bruger, hvis der ikke er gemt noget endnu
export function useLocalStorage<T>(noegle: string, startvaerdi: T) {
  const [vaerdi, setVaerdi] = useState<T>(() => {
    try {
      const gemt = localStorage.getItem(noegle);
      // Er der allerede gemt noget? Så brug det. Ellers brug startværdien.
      // localStorage kan kun gemme tekst, så vi laver teksten om
      // til et rigtigt objekt med JSON.parse.
      return gemt !== null ? (JSON.parse(gemt) as T) : startvaerdi;
    } catch {
      // Hvis noget gik galt med at læse, starter vi bare forfra.
      return startvaerdi;
    }
  });

  // Hver gang værdien ændrer sig, skriver vi den til localStorage.
  useEffect(() => {
    try {
      localStorage.setItem(noegle, JSON.stringify(vaerdi));
    } catch {
      // Hvis lagring fejler (fx hvis lageret er fuldt), gør vi ikke noget.
      // Appen virker stadig - den husker bare ikke denne gang.
    }
  }, [noegle, vaerdi]);

  // Vi giver værdien og en funktion til at ændre den tilbage,
  // ligesom useState gør.
  return [vaerdi, setVaerdi] as const;
}
