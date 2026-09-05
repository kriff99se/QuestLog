# Plan: Gamification-app til daglige vaner

En app hvor gode daglige vaner giver point, levels og streaks, plus en to-do liste.

**Teknologi:** React + TypeScript + Vite + Tailwind + Framer Motion. Data gemmes
i browserens `localStorage` (ingen server, ingen database).

Vi bygger i faser. Hver fase slutter med en app der kan køres og bruges. Efter
hver fase laves en git-commit, så vi altid kan gå tilbage til noget der virkede.

---

## De 10 vaner

Nemme vaner giver færrest point, svære giver flest. Point er multipla af 5, så
det er nemt at regne i hovedet. Fra Fase 3 kan vanerne redigeres i appen.

| Vane | Sværhed | Point |
|---|---|---|
| Rydde op 10 minutter | nem | 5 |
| Læsning | nem | 10 |
| 10.000 skridt | mellem | 15 |
| 8 timers søvn | mellem | 15 |
| Ingen skærm 30 min før sengetid | mellem | 15 |
| Kode 30 minutter | mellem | 15 |
| Sauna | mellem | 15 |
| Sund kost | svær | 20 |
| Fitness | svær | 25 |
| Ingen snus | svær | 25 |

Maks. på en dag: 160 point.

---

## Datamodel i localStorage

- `vaner` — liste med `{ id, navn, ikon, point }`, startet fra de 9 standardvaner ovenfor
- `afkrydsninger` — ét objekt pr. dato, fx `"2026-09-05" -> { fitness: true, soevn: true }`
- `indstillinger` — bl.a. `taerskel` (standard 6)
- `todos` — liste med `{ id, tekst, faerdig }`

Point, levels og streaks **gemmes ikke** — de beregnes altid ud fra data ovenfor,
så de aldrig kan komme i utakt.

To bevidste forenklinger:
- Ændrer du en vanes point, gælder det også bagudrettet (scoren regnes ud fra de
  nuværende vaner).
- Sletter du en vane, ignoreres gamle afkrydsninger for den (de slettes ikke).

---

## Faser

### Fase 0 – Opsætning
Vite + React + TS + Tailwind + Framer Motion sat op. Simpel forside med app-navnet.

**Virker når:** `npm run dev` viser en side med virkende Tailwind-styling.

### Fase 1 – Vaner og afkrydsning for i dag
De 10 vaner lægges ind i localStorage første gang. Vis dagens dato og en liste med
vaner; klik skifter mellem gjort / ikke gjort. Afkrydsninger gemmes pr. dato.

**Virker når:** du krydser vaner af, genindlæser siden, og de er der stadig.

### Fase 2 – Point og levels
Læg alle afkrydsningers point sammen. Level-pris stiger lineært med 10 pr.
level (100, 110, 120 …); level 100 svarer til ca. 60.000 point. Vis samlede
point, nuværende level og en fremskridtsbjælke mod næste level. Desuden en
level-titel — ny ca. hvert 4. level, Noob → … → GOAT — med emoji eller et
valgfrit billede.

**Virker når:** en afkrydsning øger pointtallet, bjælken fyldes, level stiger ved grænsen.

### Fase 3 – Rediger vaner i appen
Skærm hvor du kan tilføje, omdøbe, skifte ikon, skifte point og slette vaner.
Ændringer gemmes i localStorage.

**Virker når:** dine ændringer huskes efter genindlæsning og påvirker pointberegningen.

### Fase 4 – Streaks og "godt nok"-tærskel
- Samlet dags-streak: antal grønne dage i træk (en grøn dag = du rammer tærsklen).
- Streak pr. vane: flamme-tal ved hver vane = dage i træk den vane er holdt.
- Tærskel er en indstilling, standard 7 ud af 10, kan ændres.
- Hjælpe-knap til at skifte "dagens dato" frem/tilbage, så streaks kan testes.

**Virker når:** grønne dage i træk tæller op; en manglet dag nulstiller.

### Fase 5 – To-do liste
Tilføj opgave, marker som færdig, slet opgave. Gemmes i localStorage.

**Virker når:** opgaver og deres status overlever en genindlæsning.

### Fase 6 – Animationer med Framer Motion
Lille "pop" ved afkrydsning. `+X` der svæver op ved point. Kort fejring ved level up.

**Virker når:** bevægelserne er glatte, og alt fra tidligere faser virker stadig.

### Fase 7 – Finpudsning (valgfri)
Simpel historik-/kalendervisning. "Nulstil alt"-knap med bekræftelse. Tjek
mobil-layout.

**Virker når:** appen er rar at bruge dagligt.
