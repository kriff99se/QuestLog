# Billeder til level-titler

Læg billedfiler her, hvis du vil have et billede i stedet for emojien
ved en titel.

Sådan gør du:

1. Læg fx en fil `zyzz.jpg` ind i denne mappe (`public/titler/`).
2. Åbn `src/titler.ts`.
3. Find titlen og tilføj feltet `billede`:

   ```ts
   { fraLevel: 22, navn: "Zyzz", emoji: "🔱", billede: "/titler/zyzz.jpg" },
   ```

Stien starter altid med `/titler/`, fordi alt i `public/` serveres fra roden.

Brug kun billeder du selv må bruge.
