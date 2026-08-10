import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/city-plan-dm-viewer/" : "/",
  server: {
    port: 5174,
    strictPort: true,
  },
}));
