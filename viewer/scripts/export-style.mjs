// -----------------------------------------
// 都市計画基本図の MapLibre スタイルを静的な JSON として書き出す。
//
//   npm run export:style
//
// レイヤー定義は src/layers.ts がソースで、この JSON は生成物。直接編集しない。
// ビューワは背景地図の切替とテーマの色差し替えのためにレイヤーを実行時に組み立てて
// いるが、それだけでは QGIS や Maputnik のような外部ツールに渡せないため書き出す。
//
// TypeScript を読むために Vite の ssrLoadModule を使う。追加の依存は無い。
// -----------------------------------------
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec'
import { createServer } from 'vite'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const OUT_DIR = join(ROOT, 'public', 'style')
const THEMES = ['light', 'dark']

const server = await createServer({
  root: ROOT,
  logLevel: 'warn',
  server: { middlewareMode: true },
})

try {
  const { buildStyle } = await server.ssrLoadModule('/src/layers.ts')
  await mkdir(OUT_DIR, { recursive: true })

  for (const theme of THEMES) {
    const style = buildStyle(theme)

    const errors = validateStyleMin(style)
    if (errors.length > 0) {
      console.error(`${theme}: スタイルが不正`)
      for (const e of errors) console.error(`  - ${e.message}`)
      process.exitCode = 1
      continue
    }

    const path = join(OUT_DIR, `kihonzu-${theme}.json`)
    await writeFile(path, `${JSON.stringify(style, null, 2)}\n`, 'utf8')

    const counts = style.layers.reduce((acc, l) => {
      acc[l.type] = (acc[l.type] ?? 0) + 1
      return acc
    }, {})
    const detail = Object.entries(counts)
      .map(([t, n]) => `${t}:${n}`)
      .join(' ')
    console.log(`public/style/kihonzu-${theme}.json  ${style.layers.length}レイヤー（${detail}）`)
  }
} finally {
  await server.close()
}
