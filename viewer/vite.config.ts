import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/dm-converter/" : "/",
  server: {
    port: 5174,
    strictPort: true,
    // WSL から Windows 側（/mnt/c）のファイルを見る構成では inotify イベントが
    // 届かず、ファイルを書き換えても dev サーバが古い変換結果を返し続ける。
    // git のブランチ切替でも気付かないため、変更したはずのコードが画面に出ない。
    // ポーリングで検知する。CPU を常時使うが、空振りの調査コストのほうが高い。
    watch: {
      usePolling: true,
      interval: 300,
    },
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
