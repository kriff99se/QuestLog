import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// Konfiguration af Vite (vores udviklingsserver og byggeværktøj).
export default defineConfig({
  // Appen ligger på GitHub Pages under .../QuestLog/, så alle stier
  // skal starte med "/QuestLog/". Lokalt (npm run dev) virker det stadig.
  base: "/QuestLog/",

  plugins: [
    // Lærer Vite at forstå React.
    react(),
    // Lærer Vite at forstå Tailwind.
    tailwindcss(),
    // Gør appen til en PWA: den kan lægges på hjemmeskærmen og virke offline.
    VitePWA({
      // "autoUpdate": når vi lægger en ny version online, henter appen den
      // selv næste gang telefonen har net - man skal ikke gøre noget.
      registerType: "autoUpdate",

      // Ekstra filer der skal med i offline-cachen (ud over selve appen).
      includeAssets: ["favicon.png", "apple-touch-icon.png"],

      // "manifestet" er det kort med appens navn, farver og ikoner, som
      // iOS/Android bruger, når appen ligger på hjemmeskærmen.
      manifest: {
        name: "QuestLog",
        short_name: "QuestLog",
        description: "Vane-tracker med point, levels og streaks",
        lang: "da",
        // Åbn i fuld skærm uden browser-bjælke.
        display: "standalone",
        orientation: "portrait",
        // Farve på statuslinjen og på "splash"-skærmen mens appen loader.
        theme_color: "#0f172a",
        background_color: "#0f172a",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          // "maskable" = ikonet må gerne beskæres til en rund/firkantet form.
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
