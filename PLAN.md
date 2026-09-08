# Plan: Gamification-app til daglige vaner

En app hvor gode daglige vaner giver point, levels og streaks, plus en to-do liste.

**Teknologi:** React + TypeScript + Vite + Tailwind. Animationer laves med ren
CSS (planen sagde Framer Motion, men det virkede ikke i denne opsætning - se
Fase 6). Data gemmes i browserens `localStorage` (ingen server, ingen database).
Appen er en **PWA** (kan lægges på hjemmeskærmen, virker offline) og hostes på
**GitHub Pages**: <https://kriff99se.github.io/QuestLog/>

Vi bygger i faser. Hver fase slutter med en app der kan køres og bruges. Efter
hver fase laves en git-commit, så vi altid kan gå tilbage til noget der virkede.

---

## Status (opdateret 5. september 2026 — alle faser færdige + ekstra features)

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

Ekstra features bygget efter planen:
- Level-/point-kortet klæber fast øverst på skærmen ved scroll.
- Valgfrit "sparer kr/dag"-felt pr. vane med en 💰-visning ("Ingen snus" =
  60 kr/dag). Gamle "Ingen snus"-vaner får feltet sat automatisk.

Alt er skubbet til GitHub (`origin/main`). Seneste commit: `668aa4b`.

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

- `vaner` — liste med `{ id, navn, ikon, point, sparerPrDag? }`, startet fra de
  10 standardvaner ovenfor. `sparerPrDag` er valgfri (kr sparet pr. dag vanen
  holdes) *(findes)*
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
- **Menu med faner** — startede som "I dag" / "Rediger vaner", er undervejs
  vokset til fire: "I dag", "Rediger vaner", "To-do", "Historik". Hvilken fane
  man er på, gemmes *ikke* — appen starter altid på "I dag".
- **Fase 3-detaljer:** sletning af en vane bekræftes med en "er du sikker?"-boks
  (`window.confirm`). Nye vaner får et id ud fra tidspunktet, fx
  `"vane-1788630943107"`.
- **Fase 4-regel:** "i dag" tæller kun med i den samlede streak, hvis dagen
  allerede er grøn; ellers tælles der fra i går, så streaken ikke står på 0 hver
  morgen. Samme regel for streak pr. vane.
- **Fase 4-testværktøj (FJERNET igen):** var en linje nederst med
  ◀ dag / I dag / dag ▶ til at flytte "dagens dato" frem og tilbage, så
  streaks kunne afprøves uden at vente. Fjernet efter appen var færdig og
  i brug - `src/DatoHjaelper.tsx` slettet, og `datoForskudt` samt hele
  `datoForskydning`-logikken taget ud af `App.tsx` (`dato` er nu bare
  `iDagISO()`).
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
- ~~Testværktøj nederst: ◀ dag / I dag / dag ▶ flytter "dagens dato"~~
  (fjernet igen efter appen var i brug - se "beslutninger undervejs").

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
  padding på mobil (`p-4 sm:p-6`), `overflow-x-clip` på ydersiden så
  siden aldrig kan scrolles vandret, `flex-wrap` på linjerne nederst
  (backup / nulstil), og `min-w-0` + `break-words` på vane-navne og titlen,
  så lang tekst bryder om i stedet for at skubbe kortet ud over kanten.
  `<meta viewport>` var allerede på plads i `index.html`.
- ✅ **Level-kortet klæber fast øverst.** På "I dag"-skærmen er point-/
  level-kortet gjort `sticky top-0 z-20`, så man altid kan se sit level
  og fremskridtsbjælken, også når man har scrollet langt ned i vane-listen.
  (Derfor bruger ydersiden `overflow-x-clip` og ikke `-hidden` - `hidden`
  ville slå `sticky` ihjel.)

### Ekstra: PWA + hosting på GitHub Pages (efter Fase 7)

Appen kan nu lægges på telefonens hjemmeskærm og virke offline.

- `vite-plugin-pwa` laver et manifest + en service worker (offline-cache).
  `registerType: "autoUpdate"` = ny version hentes selv, når der er net.
- Ikoner ligger i `public/`: `icon-192.png`, `icon-512.png`,
  `apple-touch-icon.png` (180 px, til iOS), `favicon.png`. Tegnet som et
  grønt flueben på mørk baggrund (headless Chrome fra en lille SVG).
- `index.html` har fået `theme-color` + `apple-mobile-web-app-*`-tags.
  Statuslinje-stil er `default`, så indholdet ikke ryger op under uret.
- **`vite.config.ts` har `base: "/QuestLog/"`**, fordi Pages serverer fra
  `.../QuestLog/`. Lokalt kører `npm run dev` derfor nu på
  `http://localhost:5173/QuestLog/` (ikke længere `/`).
- Hosting: `.github/workflows/deploy.yml` bygger og deployer til Pages ved
  hvert push til `main`. Pages er sat til "GitHub Actions" som kilde.
- **Bemærk:** telefon-versionen (kriff99se.github.io) og den lokale version
  (localhost) er to adskilte "kasser" i browseren - data deles ikke mellem
  dem.

### Ekstra: redesign af "Hjem"-skærmen (mere app-agtig på iPhone)

Problemet var, at appen åbnede på *statistik* - man skulle scrolle forbi
tre store kort (titel, level, streak) for at nå det, man kom for: at
krydse dagens vaner af. Løsningen:

- **Bund-menu** (`BundMenu.tsx`) i stedet for pille-faner i toppen. Faste
  streg-ikoner (Hjem / To-do / Historik / Rediger). Føles som en iOS-app.
  "Sikkerhedskopi" + "Nulstil alt" flyttet ind under "Rediger".
- **Kompakt status-stribe** (`StatusStribe.tsx`) klæber fast øverst på
  Hjem og samler alt det vigtige på fire tynde linjer:
  1. level-titel + level ... streak
  2. "1.020 point · 60 til Level 9"
  3. fremskridtsbjælke mod dagens grønne dag
  4. "du er tæt på"-linjen (🎯)
  De gamle `TitelBanner`- og `PointOversigt`-kort er begge sløjfet - deres
  indhold (titel + billede, point i alt, point til næste level) er flyttet
  op i stribjen, så det er øverst og altid synligt. Under vanerne står nu
  kun "Denne uge"-kortet.
- **Vanerne kommer nu FØRST** - lige under stribjen. Klarede vaner tones
  ned (opacity), så de lyse kort, der er tilbage, er dem øjet fanger.
- Det store streak-kort er slanket til et "Denne uge"-kort (uge-spor +
  rekord + tærskel-tandhjul) og flyttet NED under vanerne, sammen med
  titel-kortet og level-bjælken.
- Slank header: lille "QuestLog" + dato.

### Ekstra: motivations-forbedringer

Psykologiske greb der skal gøre det lettere at blive ved.

**1. Streak-skjold + personlig rekord** (`src/streaks.ts`)
- En streak tåler nu ÉN misset dag ("skjoldet"). Den dag tæller ikke med,
  men nulstiller heller ikke streaken. Misser man to i træk - eller én mere
  efter skjoldet er brugt - er den slut. Formål: en enkelt dårlig dag sender
  ikke folk tilbage til nul, hvilket er dét, der får dem til at give op.
  Gælder både den samlede dags-streak og streak pr. vane.
- `samletStreak` returnerer nu `{ dage, skjoldBrugt }`. Kortet viser en
  🛡️-besked, når skjoldet har reddet en dag (kun hvis hullet lå midt i
  streaken - ikke i den tomme tid før den begyndte).
- Ny `laengsteStreak(...)`: den længste streak nogensinde, regnet ud fra hele
  historikken. Vist som "Rekord" på streak-kortet - kan aldrig mistes.

**2. "Du er tæt på"-linje** (`src/StreakBanner.tsx`)
- Én kort linje på streak-kortet: enten "Kun 2 vaner til en grøn dag i dag"
  (når dagen ikke er grøn endnu, i gult), eller "2 dage til en 7-dages
  streak" (når den er grøn, i grønt). Milepæle: 3, 7, 14, 30, 60, 100,
  200, 365 - derefter næste hundrede. Udnytter "goal-gradient"-effekten:
  motivationen stiger, jo tættere man er på et mål.

**3. "Uge for uge" i historikken** (`src/Historik.tsx`)
- Under månedskalenderen: én række pr. uge (mandag-søndag) fra denne uge og
  bagud til den første registrerede dag. Hver række har et 7-felts spor
  (grønne felter = grønne dage), tælleren "X/7", og point-tallet i en
  tooltip. Ugen med flest grønne dage får 🏆 og en grøn baggrund, og der
  står "Din bedste uge: N grønne dage" øverst. Man kan altså konkurrere
  mod sig selv uge efter uge.
- Ny hjælper `pointForDatoer(...)` i `point.ts`.

### Ekstra: trofæer (achievements)

- `achievements.ts`: ~41 trofæer på tværs af app'ens mekanik - streaks
  (1/3/7/14/30/60/100/200/365), levels (2→100), point i alt, antal
  afkrydsninger, perfekte dage (alle vaner én dag), penge sparet, noter,
  to-do, "prøvet alt", "comeback". Hvert har en tier (bronze → sølv →
  guld → platin → legendarisk) og en værdi (20 → 5.000).
- **Trofæer beregnes altid ud fra data** - de gemmes ikke (samme princip
  som point og streaks). `opnaaedeTrofaeer(data)` filtrerer listen.
- `trofaeScore` = summen af de opnåede værdier. Det er en **separat**
  progression fra level - vanerne driver stadig level'et, så et trofæ ikke
  kan skabe en cirkel ("nå level 10" → point → level).
- Ny **"Trofæer"-fane** (bund-menuen har 5 faner nu). `Trofaeer.tsx` viser
  listen delt i "Opnået" og "Mangler" med fremskridtsbjælke.
- **Fejring når et nyt trofæ låses op** (`TrofaeFejring.tsx`) - App holder
  en kø, så flere på én gang vises efter hinanden. Bemærk: `setState`-
  updater-funktioner må ikke have sideeffekter (`.shift()` på en ref) -
  StrictMode kalder dem to gange, og så forsvandt fejringen. Løst ved at
  læse den nuværende værdi fra closure i stedet.

### Ekstra: historik pr. vane, dagbogs-note, flyt vaner

- **Flyt rundt på vaner:** hver række i "Rediger vaner" har op/ned-pile.
  Rækkefølgen bestemmer, hvordan vanerne står på Hjem-skærmen.
- **Dagbogs-note pr. dag** (`DagNote.tsx`): et valgfrit tekstfelt "Note
  til i dag" på Hjem, gemt under localStorage-nøglen `noter` (ét stykke
  tekst pr. dato, tom = fjernet). Med i backup og "Nulstil alt".
- **Dag-detaljer i historikken:** kalenderdage kan trykkes på → et panel
  viser datoen, hvilke vaner der blev klaret, og dagens note. Dage med en
  note får en lille prik.
- **Historik pr. vane:** en `<select>` øverst i historikken - "Alle vaner"
  (den samlede grøn-dag-visning) eller én bestemt vane. Vælger man en
  vane, farves kalenderen efter om lige den vane blev klaret, og
  opsummeringen viser "X dage med Fitness", nuværende stime og rekord for
  den vane. Ny `laengsteVaneStreak(...)` i `streaks.ts` (delt logik med
  `laengsteStreak` via den nye `laengsteRun`-hjælper).

### Ekstra: sikkerhedskopi (backup) af data

Fordi data kun lever ét sted (den browser / telefon), er der to knapper
nederst i appen (`src/Backup.tsx`):

- **Gem backup:** samler `vaner`, `afkrydsninger`, `indstillinger` og `todos`
  i én JSON-fil (`questlog-backup-ÅÅÅÅ-MM-DD.json`). På telefon bruges "del"-
  arket (`navigator.share` med fil), så man kan gemme i Filer / sende til sig
  selv; på computer et almindeligt download-link.
- **Indlæs backup:** vælg en fil → bekræft ("alt nuværende data erstattes")
  → filens indhold skrives til localStorage → siden genindlæser.
- Testet frem og tilbage: eksport → slet data → import → alt korrekt gendannet.

### Ekstra: uge-vaner (vaner der ikke skal gøres hver dag)

Nogle vaner skal ikke laves hver dag - fx Fitness 5 gange om ugen, Sauna
4 gange. Løsningen er et valgfrit felt `maalPrUge` på en `Vane`:

- **`maalPrUge` er 0 / ikke sat:** helt almindelig daglig vane (uændret).
- **`maalPrUge` er 1-7:** vanen bliver en "uge-vane".

Hvad ændrer sig for en uge-vane:
- **Kortet** (`VaneKort.tsx`): under "X point" står nu en fremskridts-linje
  for ugen - `maalPrUge` prikker der fyldes op + teksten "3 / 4 i denne uge"
  (grøn + "✓ Klaret i denne uge" når målet er nået). Man krydser stadig bare
  vanen af på de dage, man gør den; ugen tælles op af sig selv.
- **🔥-pillen** viser **uger i træk**, hvor målet er ramt ("🔥 3 uger"), i
  stedet for dage i træk. Ny `ugeStreak(...)` + `laengsteUgeStreak(...)` i
  `streaks.ts` (uge = mandag-søndag, samme "denne uge er i gang"-regel som
  dags-streaken, intet skjold). Ny dato-hjælper `forrigeUgesMandag` i
  `datoer.ts`, og `gjortIUge(...)` i `streaks.ts`.
- **Grøn dag:** en uge-vane, der er krydset af i dag, tæller med i dagens
  opgørelse ligesom en daglig vane (valgt af projektejeren). Men "grøn dag"-
  **tærsklen** måles nu mod antallet af *daglige* vaner (`antalDaglige` i
  `App.tsx`), så den ikke bliver uopnåelig på dage uden uge-vaner. Teksten på
  streak-kortet siger nu "mindst N daglige vaner".
- **Trofæet "perfekt dag"** kræver nu kun alle *daglige* vaner (ellers var
  det umuligt på dage, hvor uge-vanerne ikke skal laves) - `perfekteDage` i
  `achievements.ts`.
- **Historik pr. vane:** vælger man en uge-vane i historik-filteret, viser
  opsummeringen "uger i træk (mål: N/uge)" + rekord i stedet for dags-stime.
- **Rediger vaner:** nyt felt "Mål pr. uge" (0-7) ved siden af Point og
  Sparer kr/dag, med en kort forklaring under listen.
- Point er **uændret** - hvert flueben giver stadig vanens point.

Bemærk: eksisterende brugere har fjernet standard-vanen "Sauna" fra deres
liste; "Fitness" er sat til `maalPrUge: 5` i appen. `STANDARD_VANER` er ikke
ændret (ingen migrering nødvendig - feltet er bare fraværende = daglig).

### Ekstra: penge sparet pr. vane (efter Fase 7)

Valgfrit felt `sparerPrDag` på en `Vane` (kroner sparet for hver dag vanen
holdes). "Ingen snus" har 60 kr/dag som standard i `STANDARD_VANER`.

- Har en vane et beløb > 0, viser dens kort en lille "💰 Se hvad du har
  sparet"-knap. Foldet ud: "Du har sparet X kr — N dage × beløb".
- Beløbet er **alle dage nogensinde** hvor vanen er krydset af, ikke kun
  den nuværende stime. Ny hjælper `antalDageVaneGjort` i `streaks.ts`.
- `RedigerVaner` har et "Sparer kr/dag"-felt ved siden af "Point", så
  beløbet kan ændres (eller sættes på andre vaner).
- Bevidst valg: generelt felt frem for at hardkode "ingen-snus" og 60 -
  så overlever det, at vanen redigeres, og virker for andre "undgå"-vaner.
- `VaneKort` er skrevet lidt om: rammen/farven ligger nu på `<li>`, så
  penge-linjen kan ligge i samme kort som selve afkrydsningen (uden at
  have en `<button>` inde i en `<button>`).
- **Engangs-opdatering (`App.tsx`):** "Ingen snus"-vaner gemt *før* penge-
  funktionen mangler feltet `sparerPrDag`. En lille `useEffect` sætter det
  til 60, hvis det aldrig har været sat — så besparelsen dukker op af sig
  selv efter `git pull`, uden at man skal ind i "Rediger vaner". Har man
  selv valgt et beløb (også 0), rører den det ikke. Verificeret på
  `localhost:5173`: feltet blev fjernet, siden genindlæst, og feltet kom
  automatisk tilbage som 60; 💰-linjen regnede rigtigt (1 dag × 60 = 60 kr).
