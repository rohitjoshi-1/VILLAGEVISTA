import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * vite.config.js — Tailwind v4 setup
 *
 * In Tailwind v4, the Vite plugin replaces the old PostCSS pipeline entirely.
 * No postcss.config.js, no tailwind.config.js needed.
 * The plugin reads your CSS file directly and handles everything.
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind v4 Vite plugin — replaces postcss approach
  ],
  server: {
    port: 5173,
    open: true,
  },
});