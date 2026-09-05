import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Konfiguration af Vite (vores udviklingsserver og byggeværktøj).
// Vi slår to plugins til: ét der lærer Vite at forstå React,
// og ét der lærer Vite at forstå Tailwind.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
