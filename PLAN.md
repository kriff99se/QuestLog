# Plan: Gamification-app til daglige vaner

En app hvor gode daglige vaner giver point, levels og streaks, plus en to-do liste.

**Teknologi:** React + TypeScript + Vite + Tailwind. Animationer laves med ren
CSS (planen sagde Framer Motion, men det virkede ikke i denne opsætning - se
Fase 6). Data gemmes i browserens `localStorage` (ingen server, ingen database).

Vi bygger i faser. Hver fase slutter med en app der kan køres og bruges. Efter
hver fase laves en git-commit, så vi altid kan gå tilbage til noget der virkede.

---

## Status (opdateret 5. september 2026, alle faser færdige)

| Fase | Status |
|---|---|
| Fase 0 – Opsætning | ✅ Færdig |
| Fase 1 – Vaner og afkrydsning for i dag | ✅ Færdig |
| Fase 2 – Point og levels (+ level-titler) | ✅ Færdig |
| Fase 3 – Rediger vaner i appen | ✅ Færdig |
| Fase 4 – Streaks og tærskel | ✅ Færdig |
| Fase 5 – To-do liste | ✅ Færdig |
| Fase 6 – Animationer | ✅ Færdig |
| Fase 7 – Finpudsning | ✅ Færdig |

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
- `todos` — liste med `{ id, tekst, faerdig }` *(findes fra Fase 5)*

Point, levels og streaks **gemmes ikke** — de beregnes altid ud fra data ovenfor,
så de aldrig kan komme i utakt. Point kommer nu fra to steder: vane-afkrydsninger
+ færdige to-do opgaver (5 point pr. færdig opgave, `POINT_PR_OPGAVE` i
`src/point.ts`).

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
- **Streak-kortets design:** stort glødende tal + et uge-spor (mandag–søndag)
  hvor grønne dage vises som flammer og i dag har en grøn ring. Tærskel-
  indstillingen er skjult bag et lille tandhjul, så kortet ikke roder.
- **Vane-streakens design:** flamme-tallet på hvert vane-kort vises som en
  afrundet "pille" ved afkrydsnings-cirklen. Farven bliver varmere med længden:
  gul under 7 dage, orange fra 7, rød med glød fra 30. Grænserne står øverst i
  `src/VaneKort.tsx`.
- **Fase 5 – To-do:** en tredje fane "To-do" ved siden af "I dag" og "Rediger
  vaner". Ny opgave tilføjes med knap eller Enter-tasten; tom tekst ignoreres.
  Opgaver ligger i den rækkefølge de blev skrevet. Gemmes som `todos` i
  localStorage. Komponenten er `src/TodoListe.tsx`.
- **Fase 5 – opgaver giver point (valgt "mulighed A").** Hver færdig opgave
  giver 5 point (`POINT_PR_OPGAVE`), samme som den nemmeste vane, så opgaver
  er en bonus og ikke den store pointkilde. Vi overvejede også et eget
  point-felt pr. opgave (mulighed B), men droppede det for at holde det simpelt.
  Point regnes ud fra listen som den ser ud nu — sletter man en færdig opgave,
  ryger de 5 point med (samme regel som at slette en vane). Det er med vilje:
  det gør point-farming mindre attraktivt.
- **Fase 5 – "Færdige"-folder.** To-do siden er delt i "Skal gøres" øverst og
  en foldbar "Færdige (N) · P point"-folder nederst. Folderen starter lukket,
  og indholdet tegnes først når man folder den ud — så tusindvis af gamle
  opgaver hverken fylder skærmen eller sløver siden. Sletning af en *færdig*
  opgave bekræftes med en `window.confirm` (fordi det koster point); opgaver
  der ikke er klaret, slettes uden at spørge.
- **Fase 6 – animationer med ren CSS i stedet for Framer Motion.** Planen
  sagde Framer Motion, og pakken lå i `package.json`. Men da vi prøvede,
  ville dens animationer ikke køre i denne opsætning (Framer Motion 13 +
  React 19 + Vite 8) - elementerne blev bare stående på deres startværdi.
  I stedet bruger vi almindelige CSS-`@keyframes` (se `src/index.css`):
  enklere at forstå, ingen ekstra pakke (bundt tilbage til ~207 KB), og
  det virker. `framer-motion` er afinstalleret.
- Animationer der reagerer på ændringer i point/level opdages ved at gemme
  den forrige værdi i en `useRef` og sammenligne i en `useEffect`. "+X" og
  fejringen fjernes igen af en `setTimeout` (ikke af "animation slut"), så
  det også virker, hvis brugeren har slået bevægelse fra i sit system.
- **Bemærk om test:** animationerne kunne ikke ses i det automatiske
  browser-vindue, fordi den fane kører i baggrunden, og browsere sætter
  CSS-animationer på pause i baggrundsfaner. Selve logikken (klasser sættes
  på, fejrings-laget dukker op ved level up, "+X" ved point) er afprøvet.

---

## Faser

### Fase 0 – Opsætning ✅
Vite + React + TS + Tailwind sat op. Simpel forside med app-navnet.

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
  Vist som stort tal + uge-spor (mandag–søndag).
- Streak pr. vane: flamme-pille ved hver vane = dage i træk den vane er holdt.
  Samme "i dag"-regel som ovenfor. Pillens farve bliver varmere med længden.
- Tærskel er en indstilling, standard 7 ud af 10, kan ændres (skjult bag et
  tandhjul på streak-kortet). Gemmes som `indstillinger` i localStorage.
- Testværktøj nederst: ◀ dag / I dag / dag ▶ flytter "dagens dato" frem og
  tilbage, så streaks kan afprøves uden at vente. Forskydningen gemmes ikke.

**Virker når:** grønne dage i træk tæller op; en manglet dag nulstiller.

### Fase 5 – To-do liste ✅
Tilføj opgave, marker som færdig, slet opgave. Gemmes i localStorage.
Egen fane "To-do". Tilføj med knap eller Enter. Klaret opgave får streg over.
Hver færdig opgave giver 5 point. Færdige opgaver ligger i en foldbar folder,
der starter lukket.

**Virker når:** opgaver og deres status overlever en genindlæsning.

### Fase 6 – Animationer (ren CSS) ✅
Lille "pop" ved afkrydsning. `+X` der svæver op ved point. Kort fejring ved level up.

**Virker når:** bevægelserne er glatte, og alt fra tidligere faser virker stadig.

Detaljer:
- **Pop ved afkrydsning:** vane-kort og to-do cirkler dykker lidt, mens man
  klikker (`active:scale-...`), og fluebens-cirklen laver et lille skala-"pop"
  (CSS-klassen `animer-pop`), styret af en `popper`-state der slukkes efter
  300 ms. I `VaneKort.tsx` og `TodoListe.tsx`.
- **"+X" der svæver op:** i `App.tsx` husker vi det forrige pointtal i en
  `useRef`. Stiger tallet, viser vi forskellen som et grønt `+X` (`animer-flyv-op`),
  der toner ind, svæver op og forsvinder (ca. 1 sek.). Ligger oven på point-kortet.
- **Fejring ved level up:** komponenten `Fejring.tsx`. Et mørkt lag over hele
  skærmen med en boks der "popper" ind (🎉 + "Level N!"). Lukker af sig selv
  efter 2,5 sek. eller ved klik.
- **Testværktøjet slår animationerne fra:** når man "tidsrejser" med dato-
  værktøjet, springes point-/level-animationer over, så man ikke får en
  fejring for point på en anden dag.

### Fase 7 – Finpudsning ✅
Simpel historik-/kalendervisning. "Nulstil alt"-knap med bekræftelse. Tjek
mobil-layout.

**Virker når:** appen er rar at bruge dagligt.

- ✅ **Historik-fane:** en ny fane "Historik" (`Historik.tsx`) med en
  måneds-kalender. Hver dag er farvet: grøn = nåede tærsklen, gul = noget
  gjort men ikke nok, grå = ingenting. Pile skifter måned, og der er en
  lille tæller ("X grønne dage i September 2026") + en farve-forklaring.
  Nye dato-hjælpere i `datoer.ts`: `maanedensDatoer`, `tommeFoerMaaned`,
  `maanedNavn`, `dagIMaaned`.
- ✅ **"Nulstil alt"-knap:** en farezone nederst i appen (`NulstilAlt.tsx`).
  Spørger to gange med `window.confirm`, og sætter så alle data
  (vaner, afkrydsninger, indstillinger, todos) tilbage til startværdi.
- ✅ **Mobil-layout:** afprøvet ved 390 px bredde. Rettelser: mindre
  padding på mobil (`p-4 sm:p-6`), `overflow-x-hidden` på ydersiden så
  siden aldrig kan scrolles vandret, `flex-wrap` på testværktøjet og
  nulstil-linjen, og `min-w-0` + `break-words` på vane-navne og titlen,
  så lang tekst bryder om i stedet for at skubbe kortet ud over kanten.
  `<meta viewport>` var allerede på plads i `index.html`.
