# Plan: Gamification-app til daglige vaner

En app hvor gode daglige vaner giver point, levels og streaks, plus en to-do liste.

**Teknologi:** React + TypeScript + Vite + Tailwind + Framer Motion. Data gemmes
i browserens `localStorage` (ingen server, ingen database).

Vi bygger i faser. Hver fase slutter med en app der kan køres og bruges. Efter
hver fase laves en git-commit, så vi altid kan gå tilbage til noget der virkede.

---

## Status (opdateret 5. september 2026)

| Fase | Status |
|---|---|
| Fase 0 – Opsætning | ✅ Færdig |
| Fase 1 – Vaner og afkrydsning for i dag | ✅ Færdig |
| Fase 2 – Point og levels (+ level-titler) | ✅ Færdig |
| Fase 3 – Rediger vaner i appen | ✅ Færdig |
| Fase 4 – Streaks og tærskel | ✅ Færdig |
| Fase 5 – To-do liste | ⬜ Ikke lavet endnu |
| Fase 6 – Animationer | ⬜ Ikke lavet endnu |
| Fase 7 – Finpudsning | ⬜ Ikke lavet endnu |

Alt er skubbet til GitHub (`origin/main`).

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

- `vaner` — liste med `{ id, navn, ikon, point }`, startet fra de 10 standardvaner ovenfor *(findes)*
- `afkrydsninger` — ét objekt pr. dato, fx `"2026-09-05" -> { fitness: true, soevn: true }` *(findes)*
- `indstillinger` — bl.a. `taerskel` (standard 7 ud af 10) *(findes)*
- `todos` — liste med `{ id, tekst, faerdig }` *(kommer i Fase 5)*

Point, levels og streaks **gemmes ikke** — de beregnes altid ud fra data ovenfor,
så de aldrig kan komme i utakt.

To bevidste forenklinger:
- Ændrer du en vanes point, gælder det også bagudrettet (scoren regnes ud fra de
  nuværende vaner).
- Sletter du en vane, ignoreres gamle afkrydsninger for den (de slettes ikke).

---

## Ændringer og beslutninger undervejs

Ting vi har besluttet, mens vi byggede, som ikke stod i den oprindelige plan:

- **Appen hedder QuestLog.** (Oprindeligt et arbejdstitel-projekt uden navn.)
- **Level-pris: lineær stigning på +10 pr. level.** Planen sagde bare "simpel
  level-formel". Vi overvejede tre modeller: fast 100 pr. level, ×1,5 pr. level,
  og lineær +10. Vi valgte **lineær +10** (100, 110, 120 …), fordi ×1,5 gjorde
  level 100 umuligt at nå, og fast 100 var lidt for fladt. Level 100 svarer nu
  til ca. 58.400 point (~1,5–2 års gode vaner). Justeres via `BASISPRIS` og
  `TRIN` i `src/point.ts`.
- **Level-titler (helt ny funktion).** 25 titler, en ny ca. hvert 4. level, fra
  "Noob" til "GOAT" med meme-referencer (Sigma, Gigachad, Zyzz …). Hver titel har
  en emoji, der virker med det samme, og et **valgfrit billede** man selv kan
  lægge i `public/titler/`. Titlerne er ren data i `src/titler.ts` og kan frit
  ændres.
- **Ekstra vane: Sauna** (mellem, 15 point). Maks. på en dag steg fra 145 til
  160 point.
- **Tærskel-standard ændret fra 6/9 til 7/10** vaner, fordi der nu er 10 vaner.
- **Menu med to faner** ("I dag" / "Rediger vaner"). Hvilken fane man er på,
  gemmes *ikke* — appen starter altid på "I dag".
- **Fase 3-detaljer:** sletning af en vane bekræftes med en "er du sikker?"-boks
  (`window.confirm`). Nye vaner får et id ud fra tidspunktet, fx
  `"vane-1788630943107"`.
- **Fase 4-regel:** "i dag" tæller kun med i den samlede streak, hvis dagen
  allerede er grøn; ellers tælles der fra i går, så streaken ikke står på 0 hver
  morgen. Samme regel for streak pr. vane.
- **Fase 4-testværktøj:** en linje nederst med ◀ dag / I dag / dag ▶ til at
  flytte "dagens dato" frem og tilbage, så streaks kan afprøves uden at vente.
  Forskydningen gemmes ikke.

---

## Faser

### Fase 0 – Opsætning ✅
Vite + React + TS + Tailwind + Framer Motion sat op. Simpel forside med app-navnet.

**Virker når:** `npm run dev` viser en side med virkende Tailwind-styling.

### Fase 1 – Vaner og afkrydsning for i dag ✅
De 10 vaner lægges ind i localStorage første gang. Vis dagens dato og en liste med
vaner; klik skifter mellem gjort / ikke gjort. Afkrydsninger gemmes pr. dato.

**Virker når:** du krydser vaner af, genindlæser siden, og de er der stadig.

### Fase 2 – Point og levels ✅
Læg alle afkrydsningers point sammen. Level-pris stiger lineært med 10 pr.
level (100, 110, 120 …); level 100 svarer til ca. 58.400 point. Vis samlede
point, nuværende level og en fremskridtsbjælke mod næste level. Desuden en
level-titel — ny ca. hvert 4. level, Noob → … → GOAT — med emoji eller et
valgfrit billede.

**Virker når:** en afkrydsning øger pointtallet, bjælken fyldes, level stiger ved grænsen.

### Fase 3 – Rediger vaner i appen ✅
Skærm hvor du kan tilføje, omdøbe, skifte ikon, skifte point og slette vaner.
Ændringer gemmes i localStorage. Sletning bekræftes først.

**Virker når:** dine ændringer huskes efter genindlæsning og påvirker pointberegningen.

### Fase 4 – Streaks og "godt nok"-tærskel ✅
- Samlet dags-streak: antal grønne dage i træk (en grøn dag = du rammer tærsklen).
  "I dag" tæller kun med, hvis dagen allerede er grøn; ellers tælles fra i går.
- Streak pr. vane: flamme-tal ved hver vane = dage i træk den vane er holdt.
- Tærskel er en indstilling, standard 7 ud af 10, kan ændres. (`indstillinger`
  oprettes i localStorage her.)
- Hjælpe-knap til at skifte "dagens dato" frem/tilbage, så streaks kan testes.

**Virker når:** grønne dage i træk tæller op; en manglet dag nulstiller.

### Fase 5 – To-do liste ⬜
Tilføj opgave, marker som færdig, slet opgave. Gemmes i localStorage.

**Virker når:** opgaver og deres status overlever en genindlæsning.

### Fase 6 – Animationer med Framer Motion ⬜
Lille "pop" ved afkrydsning. `+X` der svæver op ved point. Kort fejring ved level up.

**Virker når:** bevægelserne er glatte, og alt fra tidligere faser virker stadig.

### Fase 7 – Finpudsning (valgfri) ⬜
Simpel historik-/kalendervisning. "Nulstil alt"-knap med bekræftelse. Tjek
mobil-layout.

**Virker når:** appen er rar at bruge dagligt.
