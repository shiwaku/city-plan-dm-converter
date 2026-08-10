import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/dm-converter/" : "/",
  server: {
    port: 5174,
    strictPort: true,
  },
}));
