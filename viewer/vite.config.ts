import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/dm-converter/" : "/",
  server: {
    port: 5174,
    strictPort: true,
  },
  // main.ts が最上位 await で背景スタイルを読むため ES2022 が必要
  build: {
    target: "es2022",
  },
  define: {
    __BUILD_TIME__: JSON.stringify(
      new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
    ),
  },
}));
