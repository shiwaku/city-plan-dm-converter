/// <reference types="vite/client" />

/** vite.config.ts の define で埋め込まれるビルド時刻。 */
declare const __BUILD_TIME__: string

interface ImportMetaEnv {
  /** PMTiles の配信元。未指定なら本番の配信先を使う（src/layers.ts を参照）。 */
  readonly VITE_PMTILES_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
