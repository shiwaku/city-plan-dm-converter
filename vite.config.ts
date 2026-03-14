import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/city-shizuoka-kihonzu-on-dm/" : "/",
  server: {
    port: 5174,
    strictPort: true,
  },
}));
