import type { LayerSpecification, SourceSpecification, StyleSpecification } from 'maplibre-gl'
import { DM_SPRITE_ID, DM_SPRITE_URL, GLYPHS } from './basemap'
import { codeName } from './dmCodes'

/**
 * PMTiles の配信元。既定は本番の配信先。
 * 焼き直したタイルをマージ前に確認したい場合は、`VITE_PMTILES_BASE` で
 * ローカルの配信先に差し替える（`pmtiles serve` などで output/ を配信する）。
 *   VITE_PMTILES_BASE=http://localhost:8080 npm run dev
 */
const PMTILES_BASE =
  import.meta.env.VITE_PMTILES_BASE ?? 'https://shiworks2.xsrv.jp/shizuoka-city'

/**
 * 測量成果の使用承認（07静都都第2068号）の条件(3)で明記を求められている文言。
 * 文言は承認書で特定されているため、変更しないこと。
 */
const DM_ATTRIBUTION =
  '<a href="https://data.bodik.jp/dataset/221007_1712212695" target="_blank" rel="noopener">この地図は静岡市長の承認を得て、同市所管の2,500分の1及び10,000分の1静岡市地形図を使用して調製したものである。（承認番号07静都都第2068号）</a>'

/** 1/10,000 と 1/2,500 の表示境界。1/10,000 は未満、1/2,500 は以上を担当する。 */
export const SCALE_SWITCH_ZOOM = 15

// ---- ソース ----

export const SOURCES: Record<string, SourceSpecification> = {
  kihonzu: {
    type: 'vector',
    url: `pmtiles://${PMTILES_BASE}/kihonzu_10000.pmtiles`,
    attribution: DM_ATTRIBUTION,
  },
  kihonzu_2500: {
    type: 'vector',
    url: `pmtiles://${PMTILES_BASE}/kihonzu_2500.pmtiles`,
    attribution: DM_ATTRIBUTION,
  },
}

// ---- グループ（パネルのトグル単位） ----

export type GroupKey = 'polygon' | 'line' | 'symbol' | 'direction' | 'annotation'

export interface LayerGroup {
  key: GroupKey
  name: string
  desc: string
  on: boolean
  opacity: number
}

/** 配列の順序がパネルの並び順。 */
export const GROUPS: LayerGroup[] = [
  {
    key: 'polygon',
    name: '面',
    desc: 'DMの面要素（E1）。建物や水部などの閉じた図形。始終点が一致する線要素も面として出力される。',
    on: true,
    opacity: 1,
  },
  {
    key: 'line',
    name: '線',
    desc: 'DMの線要素（E2）。道路縁・建物外形・等高線など。公共測量標準図式の線幅（図上0.1〜0.51mm）と線種を分類コードごとに再現している。',
    on: true,
    opacity: 1,
  },
  {
    key: 'symbol',
    name: '記号',
    desc: 'DMの記号要素（E5）。公共測量標準図式の分類コード（4桁）をキーにスプライトのアイコンを表示する。',
    on: true,
    opacity: 1,
  },
  {
    key: 'direction',
    name: '方向',
    desc: 'DMの方向要素（E6）。坑口・鳥居・流水方向など、向きを持つ地図記号。角度属性に従って記号を回転させて表示する。',
    on: true,
    opacity: 1,
  },
  {
    key: 'annotation',
    name: '注記',
    desc: 'DMの注記要素（E7）。文字列を代表点に配置し、角度属性に従って回転させる。z13未満では文字が小さすぎて読めないため表示しない。',
    on: true,
    opacity: 1,
  },
]

export const groupOf = (key: GroupKey): LayerGroup => GROUPS.find((g) => g.key === key)!

// ---- テーマ連動のインク色 ----
// 都市計画基本図は白図（黒線）が既定だが、暗い背景ではそのままだと埋もれるため、
// テーマに応じて線・文字・縁取りの色を入れ替える。
export interface Ink {
  line: string
  text: string
  halo: string
  fill: string
}

export const inkFor = (theme: 'light' | 'dark'): Ink =>
  theme === 'dark'
    ? { line: '#e8eaee', text: '#f2f4f7', halo: '#14161a', fill: '#ffffff' }
    : { line: '#000000', text: '#000000', halo: '#ffffff', fill: '#ffffff' }

/** 背景の色。基本図は白図なので、テーマに合わせて紙の色を替える。 */
export const paperFor = (theme: 'light' | 'dark'): string =>
  theme === 'dark' ? '#14161a' : '#ffffff'

/**
 * テーマに応じて差し替える paint プロパティ。
 * 実行中の地図に当てる main.ts の applyInk と、静的スタイルを書き出す buildStyle の
 * 両方から使う。片方だけ直すと見た目が食い違うため、判定はここに1つだけ置く。
 */
export function inkPaint(
  type: LayerSpecification['type'],
  group: GroupKey,
  ink: Ink,
): Record<string, string> {
  switch (type) {
    case 'line':
      return { 'line-color': ink.line }
    case 'fill':
      return { 'fill-color': ink.fill }
    case 'symbol':
      return group === 'annotation'
        ? { 'text-color': ink.text, 'text-halo-color': ink.halo }
        : {}
    default:
      return {}
  }
}

// ---- レイヤー定義 ----

export interface LayerEntry {
  group: GroupKey
  spec: LayerSpecification
  /** 不透明度スライダーで操作する paint プロパティと、その基準値。 */
  opacity: Record<string, number>
}

/**
 * 書き出したスタイルの layer.metadata に載せるキー。
 * グループ分けと不透明度の基準値は MapLibre スタイル仕様に無い情報だが、
 * ビューワのパネルが必要とするため metadata で持ち回す。
 */
export const GROUP_META = 'dm-converter:group'
export const OPACITY_META = 'dm-converter:opacity'

/** 書き出したスタイルのレイヤー配列から、ビューワが使う LayerEntry を組み立てる。 */
export function layerEntriesFromStyle(layers: LayerSpecification[]): LayerEntry[] {
  const entries: LayerEntry[] = []
  for (const spec of layers) {
    const meta = (spec as { metadata?: Record<string, unknown> }).metadata
    const group = meta?.[GROUP_META] as GroupKey | undefined
    // background など、グループに属さないレイヤーはパネルの対象外。
    if (!group) continue
    entries.push({
      group,
      spec,
      opacity: (meta?.[OPACITY_META] as Record<string, number>) ?? {},
    })
  }
  return entries
}

/**
 * 注記に使うフォントスタック。地理院の最適化ベクトルタイルのグリフには
 * NotoSansJP-Regular しか無いため、明示しないと MapLibre 既定の
 * "Open Sans Regular, Arial Unicode MS Regular" を要求して404になり、文字が描画されない。
 */
const TEXT_FONT = ['NotoSansJP-Regular']

/** 注記の回転角。本コンバーターの出力は Angle、旧タイルは KAKUDO のため両対応にする。 */
const TEXT_ROTATE = [
  'let',
  'a',
  ['coalesce', ['to-number', ['get', 'Angle']], ['to-number', ['get', 'KAKUDO']], 0],
  [
    'case',
    ['any', ['==', ['var', 'a'], 90], ['==', ['var', 'a'], -90]],
    0,
    ['*', -1, ['var', 'a']],
  ],
] as unknown as LayerSpecification

/**
 * 方向（E6）の回転角。
 * Angle は水平右（東）を0度とする反時計回り。スプライトのアイコンは右（東）向きに
 * 描かれており、MapLibre の icon-rotate は時計回りのため、符号を反転するだけでよい。
 */
const ICON_ROTATE = ['*', -1, ['coalesce', ['to-number', ['get', 'Angle']], 0]]

// 方向（E6）は以前、スプライトにアイコンが無いコードを列挙して除外していた。
// アイコン追加（9ee1b99）に除外リストが追随せず、実際には存在する
// 5227（せき）・7212（露岩）・2219（道路のトンネル）の436件が出ないままだった。
// 同種の取りこぼしを繰り返さないよう、列挙はやめて全コードを描く。
// アイコンが無い場合は main.ts の styleimagemissing で透明画像を割り当て、
// 読み込み失敗の報告を出さずに何も描かない状態にする。

/**
 * 注記を出し始めるズーム。これ未満では文字が小さすぎて読めないため出さない。
 * scripts/build.sh の ANNOTATION_MIN_ZOOM / KIJUNTEN_MIN_ZOOM と対になっている。
 */
const ANNOTATION_MIN_ZOOM = 13

// ---- 記号の大きさの補正 ----
//
// dm-sprite のアイコンはすべて 64x64 のキャンバスだが、実際に描画されている領域
// （bbox）はアイコンごとに 4.4px〜64px とばらつく。icon-size は全コード共通なので、
// bbox が小さいアイコンだけが小さく見える。
//
// dm-sprite 自身の設計基準は bbox 10〜22px（同リポジトリの tools/gen_icons.py）。
// これを下回るものだけを目標サイズへ引き上げ、基準内のアイコンには手を入れない。
// 一律に icon-size を上げると、bbox の大きいアイコンが過大になるため。
//
// bbox は dm-sprite の tools/inspect_icons.py で実測した値（2026-08-12 時点）。
// スプライトを更新したら測り直すこと。

/** 補正後の目標 bbox。dm-sprite の設計基準 10〜22px の中央値。 */
const ICON_TARGET_PX = 18.56

/**
 * 設計基準（10px）を下回るアイコンのうち、目標サイズへ引き上げるものの実測 bbox。
 *
 * 基準を下回っていても補正しないものがある。いずれも図式上そもそも小さく描く記号で、
 * 基準の中央値まで引き上げると大きすぎた。
 *   7311 標石を有しない標高点（4.44px）
 *   7312 図化機測定による標高点（4.44px）
 *   8199 指示点（5.94px）
 *   2238 並木（6.19px）
 * 標高点と指示点は数値注記と組で読む点記号で、記号そのものを目立たせる必要がない。
 */
const ICON_BBOX_PX: Record<string, number> = {
  '3401': 6.19, // 門
  '5226': 9.31, // 滝
  '6311': 9.94, // 田
  '6331': 9.94, // 広葉樹林
  '6340': 9.94, // 砂れき地（未分類）
}

/** 分類コードから記号の大きさの補正倍率を引く式。補正しないコードは 1.0。 */
const iconScale = (): unknown[] => {
  const match: unknown[] = ['match', ['get', 'Code']]
  for (const [code, bbox] of Object.entries(ICON_BBOX_PX)) {
    match.push(code, Math.round((ICON_TARGET_PX / bbox) * 100) / 100)
  }
  match.push(1.0)
  return match
}

// ---- 分類コード別の線種（公共測量標準図式） ----
//
// 図式の線幅・線種を分類コードごとに再現する。仕様は ttomii/dm-tools（Apache-2.0）の
// dm-preview/static/maplibre/style-2500.json から抽出した。同スタイルはDMのSLDと
// 図式仕様をもとに手作業で整備されたもので、線幅を図上のミリメートルで表現している。
//
// mm   … 図上の線幅（ミリメートル）。縮尺に応じて地上寸法へ換算する
// dash … line-dasharray。MapLibre では「線幅の倍数」で解釈される（units: line widths）
//
// dash はデータ駆動に対応するのが maplibre-gl 5.8.0 以降のため、それ未満では動かない。
interface LineStyle {
  mm: number
  dash?: number[]
  codes: string[]
}

const LINE_STYLES: LineStyle[] = [
  // 実線 — 2306 索道 / 2424 プラットホーム / 3401 門 / 4261 輸送管（地上）ほか
  { mm: 0.1, codes: ['2306', '2424', '3401', '4261', '4262', '4265', '6101', '6102', '7102', '7106', '7201', '7211', '7212'] },
  // 実線 — 2101 道路縁（街区線）/ 2214 石段 / 3001 普通建物 / 5101 河川・水がい線 ほか
  { mm: 0.15, codes: ['2101', '2211', '2214', '2215', '2219', '2226', '2411', '2419', '3001', '4207', '4219', '4231', '4235', '5101', '5102', '5239'] },
  // 実線 — 6110 被覆 / 6140 塀 / 7101 等高線（計曲線）ほか
  { mm: 0.2, codes: ['5203', '5226', '5227', '5228', '6110', '6140', '7101', '7105'] },
  // 実線 — 2203 道路橋（高架部）/ 2205 徒橋 / 2401 鉄道橋（高架部）/ 3002 堅ろう建物
  { mm: 0.3, codes: ['2203', '2205', '2401', '3002'] },
  // 実線 — 2301 普通鉄道。図式中で最も太い
  { mm: 0.51, codes: ['2301'] },
  // 6130 柵（未分類）・垣
  { mm: 0.2, dash: [10, 7.5], codes: ['6130'] },
  // 5105 湖池 / 6301 植生界
  { mm: 0.1, dash: [5, 5], codes: ['5105', '6301'] },
  // 7103 等高線（補助曲線）/ 7107 凹地（補助曲線）
  { mm: 0.1, dash: [100, 5], codes: ['7103', '7107'] },
  // 2213 歩道 / 3003 普通無壁舎
  { mm: 0.1, dash: [10, 5], codes: ['2213', '3003'] },
  // 2106 庭園路等
  { mm: 0.15, dash: [10, 3.333333], codes: ['2106'] },
  // 6302 耕地界
  { mm: 0.1, dash: [30, 10], codes: ['6302'] },
  // 2103 徒歩道
  { mm: 0.3, dash: [5, 1.666667], codes: ['2103'] },
  // 1106 大字・町・丁目界
  { mm: 0.2, dash: [25, 5], codes: ['1106'] },
  // 2109 建設中の道路 / 6201 区域界
  { mm: 0.1, dash: [15, 15], codes: ['2109', '6201'] },
  // 3402 屋門
  { mm: 0.15, dash: [3.333333, 1.666667], codes: ['3402'] },
  // 3004 堅ろう無壁舎。3402 と同じ破線で幅だけ違う
  { mm: 0.3, dash: [3.333333, 1.666667], codes: ['3004'] },
  // 1104 町村・指定都市の区界
  { mm: 0.3, dash: [16.666667, 2.666667, 1.333333, 2.666667], codes: ['1104'] },
  // 1103 郡市・東京都の区界
  { mm: 0.3, dash: [16.666667, 2.666667, 1.333333, 2, 1.333333, 2.666667], codes: ['1103'] },
  // 1110 所属界
  { mm: 0.3, dash: [16.666667, 26, 1.333333, 2.666667], codes: ['1110'] },
  // 2428 鉄道の雪覆い等
  { mm: 0.2, dash: [5, 2.5], codes: ['2428'] },
]

/** 表に無い分類コードの線幅。最も件数の多いクラスに寄せる。 */
const DEFAULT_LINE_MM = 0.1

/**
 * 図上1mmあたりの画面ピクセル数（ZL15・北緯35度）。
 * ZL15の分解能は約1.9567 m/px。1/2,500 では図上1mm = 地上2.5m なので 1.2937 px/mm。
 * 参照スタイルの実測値（0.1mm = 0.1293685px）と一致する。
 * 縮尺が n 倍粗くなると地上寸法が n 倍になるため、係数も n 倍する。
 */
const PX_PER_MM_AT_Z15 = 1.293685
const pxPerMm = (scaleDenominator: number): number =>
  PX_PER_MM_AT_Z15 * (scaleDenominator / 2500)

/**
 * 画面上の最小線幅。図式どおりの実寸だと 0.1mm は ZL15 で 0.13px にしかならず
 * 事実上見えないため、下限を設けて視認性を確保する。
 * 図式の幅の比率はこの下限を超えたズームから現れる。
 *
 * dasharray は線幅の倍数で解釈されるため、下限が効いている間は破線の間隔も
 * 実寸より粗くなる。実寸比を保つには dasharray 側を逆補正する必要があるが、
 * まずは粗くなるのを許容する（issue #39 の案A）。
 */
const MIN_LINE_PX = 0.6

/** line-width 式の上端ズーム。MapLibre の最大ズームに合わせる。 */
const MAX_STYLE_ZOOM = 24

/** 分類コードから図上線幅（mm）を引く式。 */
const lineMm = (): unknown[] => {
  const match: unknown[] = ['match', ['get', 'Code']]
  for (const s of LINE_STYLES) match.push(s.codes, s.mm)
  match.push(DEFAULT_LINE_MM)
  return match
}

/**
 * 図式の実寸を保ちつつ下限でクランプする line-width 式。
 *
 * `["zoom"]` は最上位の interpolate / step の入力にしか置けないため、
 * `["max", ...]` で包むことはできない。代わりに各ストップの出力側でクランプする。
 * ストップのズームは定数なので、そこでの倍率も定数に畳める。
 *
 * ストップは「最も太いクラスが下限を超えるズーム」から「最も細いクラスが超えるズーム」
 * までの整数ズームに置く。この範囲の外は全クラスが下限一定か純粋な指数なので、
 * 両端の2点で正確に表せる（指数の底2と実寸倍率が一致するため）。
 */
const lineWidth = (scaleDenominator: number, zMin: number): unknown[] => {
  const k = pxPerMm(scaleDenominator)
  const mms = [...LINE_STYLES.map((s) => s.mm), DEFAULT_LINE_MM]
  const zCross = (mm: number): number =>
    SCALE_SWITCH_ZOOM + Math.log2(MIN_LINE_PX / (mm * k))
  const zFrom = Math.floor(zCross(Math.max(...mms)))
  const zTo = Math.ceil(zCross(Math.min(...mms)))

  const stops = new Set<number>([zMin, MAX_STYLE_ZOOM])
  for (let z = zFrom; z <= zTo; z++) {
    if (z > zMin && z < MAX_STYLE_ZOOM) stops.add(z)
  }

  const expr: unknown[] = ['interpolate', ['exponential', 2], ['zoom']]
  for (const z of [...stops].sort((a, b) => a - b)) {
    expr.push(z, ['max', MIN_LINE_PX, ['*', lineMm(), k * 2 ** (z - SCALE_SWITCH_ZOOM)]])
  }
  return expr
}


/** 破線を持つ分類コード。 */
const DASHED_CODES = LINE_STYLES.filter((s) => s.dash).flatMap((s) => s.codes)

/** 分類コードから line-dasharray を引く式。 */
const lineDash = (): unknown[] => {
  const match: unknown[] = ['match', ['get', 'Code']]
  for (const s of LINE_STYLES) {
    if (s.dash) match.push(s.codes, ['literal', s.dash])
  }
  // 到達しない（DASHED_CODES でフィルタ済み）が、match には既定値が必須。
  match.push(['literal', [1, 0]])
  return match
}

const iconSize = (z1: number, s1: number, z2: number, s2: number): unknown[] => [
  'interpolate',
  ['linear'],
  ['zoom'],
  z1,
  ['*', s1, iconScale()],
  z2,
  ['*', s2, iconScale()],
]

/**
 * 描画順に並べたレイヤー定義。1/10,000 は z15 未満、1/2,500 は z15 以上を担当し、
 * ズームで自動的に入れ替わる。グループ単位で表示/不透明度を切り替える。
 */
export function buildLayers(): LayerEntry[] {
  const e: LayerEntry[] = []

  // ---- 1/10,000（z2〜z15） ----
  const S = 'kihonzu'
  e.push({
    group: 'polygon',
    opacity: { 'fill-opacity': 0.3 },
    spec: {
      id: 'kihonzu_10000_polygon_fill',
      type: 'fill',
      source: S,
      'source-layer': 'kihonzu_10000_polygon',
      minzoom: 2,
      maxzoom: SCALE_SWITCH_ZOOM,
      paint: { 'fill-color': '#ffffff', 'fill-opacity': 0.3 },
    },
  })
  e.push({
    group: 'polygon',
    opacity: { 'line-opacity': 1 },
    spec: {
      id: 'kihonzu_10000_polygon_outline',
      type: 'line',
      source: S,
      'source-layer': 'kihonzu_10000_polygon',
      minzoom: 2,
      maxzoom: SCALE_SWITCH_ZOOM,
      paint: { 'line-color': '#000000', 'line-width': lineWidth(10000, 2) as never },
    },
  })
  // 線は実線と破線の2レイヤーだけ。分類コードごとの幅・破線は match 式で引く。
  // line-dasharray はデータ駆動でも「レイヤーに設定されているか否か」は切り替えられないため、
  // 実線と破線でレイヤーを分ける必要がある。
  e.push({
    group: 'line',
    opacity: { 'line-opacity': 1 },
    spec: {
      id: 'kihonzu_10000_line_solid',
      type: 'line',
      source: S,
      'source-layer': 'kihonzu_10000_line',
      minzoom: 2,
      maxzoom: SCALE_SWITCH_ZOOM,
      filter: ['!', ['in', ['get', 'Code'], ['literal', DASHED_CODES]]] as never,
      paint: { 'line-color': '#000000', 'line-width': lineWidth(10000, 2) as never },
    },
  })
  e.push({
    group: 'line',
    opacity: { 'line-opacity': 1 },
    spec: {
      id: 'kihonzu_10000_line_dashed',
      type: 'line',
      source: S,
      'source-layer': 'kihonzu_10000_line',
      minzoom: 2,
      maxzoom: SCALE_SWITCH_ZOOM,
      filter: ['in', ['get', 'Code'], ['literal', DASHED_CODES]] as never,
      paint: {
        'line-color': '#000000',
        'line-width': lineWidth(10000, 2) as never,
        'line-dasharray': lineDash() as never,
      },
    },
  })
  e.push({
    group: 'symbol',
    opacity: { 'icon-opacity': 1 },
    spec: {
      id: 'kihonzu_10000_symbol',
      type: 'symbol',
      source: S,
      'source-layer': 'kihonzu_10000_symbol',
      minzoom: 13,
      maxzoom: SCALE_SWITCH_ZOOM,
      layout: {
        'icon-image': ['concat', `${DM_SPRITE_ID}:dm-`, ['to-string', ['get', 'Code']]] as never,
        'icon-size': iconSize(13, 0.5, 14, 0.75) as never,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
      paint: { 'icon-opacity': 1 },
    },
  })
  e.push({
    group: 'direction',
    opacity: { 'icon-opacity': 1 },
    spec: {
      id: 'kihonzu_10000_direction',
      type: 'symbol',
      source: S,
      'source-layer': 'kihonzu_10000_direction',
      minzoom: 13,
      maxzoom: SCALE_SWITCH_ZOOM,
      layout: {
        'icon-image': ['concat', `${DM_SPRITE_ID}:dm-`, ['to-string', ['get', 'Code']]] as never,
        'icon-size': iconSize(13, 0.5, 14, 0.75) as never,
        'icon-rotate': ICON_ROTATE as never,
        'icon-rotation-alignment': 'map',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
      paint: { 'icon-opacity': 1 },
    },
  })

  // 注記は ZL13 未満では文字が小さすぎて読めないため出さない。
  // 以前は基準点等の注記（KIJUNTEN_CODES）だけ1段低い ZL12 から出していたが、
  // そのズームでは読めないため分ける意味がなく、1レイヤーに統合した。
  e.push({
    group: 'annotation',
    opacity: { 'text-opacity': 1 },
    spec: {
      id: 'kihonzu_10000_annotation',
      type: 'symbol',
      source: S,
      'source-layer': 'kihonzu_10000_annotation',
      minzoom: ANNOTATION_MIN_ZOOM,
      maxzoom: SCALE_SWITCH_ZOOM,
      layout: {
        'text-field': ['coalesce', ['get', 'Text'], ''] as never,
        'text-font': TEXT_FONT,
        'text-size': 10,
        'text-anchor': 'center',
        'text-offset': [1.5, -1],
        // 都市計画基本図の注記は測量成果として決まった位置に置かれるものなので、
        // 衝突判定で間引かせず全部描く。記号（icon-allow-overlap）と揃える。
        'text-allow-overlap': true,
        'text-rotation-alignment': 'map',
        'text-rotate': TEXT_ROTATE as never,
      },
      paint: {
        'text-color': '#000',
        'text-halo-color': '#fff',
        'text-halo-width': 1.5,
        'text-opacity': 1,
      },
    },
  })

  // ---- 1/2,500（z15〜） ----
  const T = 'kihonzu_2500'
  e.push({
    group: 'polygon',
    opacity: { 'fill-opacity': 0.25 },
    spec: {
      id: 'kihonzu_2500_polygon_fill',
      type: 'fill',
      source: T,
      'source-layer': 'kihonzu_2500_polygon',
      minzoom: SCALE_SWITCH_ZOOM,
      paint: { 'fill-color': '#ffffff', 'fill-opacity': 0.25 },
    },
  })
  e.push({
    group: 'polygon',
    opacity: { 'line-opacity': 1 },
    spec: {
      id: 'kihonzu_2500_polygon_outline',
      type: 'line',
      source: T,
      'source-layer': 'kihonzu_2500_polygon',
      minzoom: SCALE_SWITCH_ZOOM,
      paint: { 'line-color': '#000000', 'line-width': lineWidth(2500, SCALE_SWITCH_ZOOM) as never },
    },
  })
  e.push({
    group: 'line',
    opacity: { 'line-opacity': 1 },
    spec: {
      id: 'kihonzu_2500_line_solid',
      type: 'line',
      source: T,
      'source-layer': 'kihonzu_2500_line',
      minzoom: SCALE_SWITCH_ZOOM,
      filter: ['!', ['in', ['get', 'Code'], ['literal', DASHED_CODES]]] as never,
      paint: { 'line-color': '#000000', 'line-width': lineWidth(2500, SCALE_SWITCH_ZOOM) as never },
    },
  })
  e.push({
    group: 'line',
    opacity: { 'line-opacity': 1 },
    spec: {
      id: 'kihonzu_2500_line_dashed',
      type: 'line',
      source: T,
      'source-layer': 'kihonzu_2500_line',
      minzoom: SCALE_SWITCH_ZOOM,
      filter: ['in', ['get', 'Code'], ['literal', DASHED_CODES]] as never,
      paint: {
        'line-color': '#000000',
        'line-width': lineWidth(2500, SCALE_SWITCH_ZOOM) as never,
        'line-dasharray': lineDash() as never,
      },
    },
  })
  e.push({
    group: 'symbol',
    opacity: { 'icon-opacity': 1 },
    spec: {
      id: 'kihonzu_2500_symbol',
      type: 'symbol',
      source: T,
      'source-layer': 'kihonzu_2500_symbol',
      minzoom: SCALE_SWITCH_ZOOM,
      layout: {
        'icon-image': ['concat', `${DM_SPRITE_ID}:dm-`, ['to-string', ['get', 'Code']]] as never,
        'icon-size': iconSize(14, 0.5, 18, 1) as never,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
      paint: { 'icon-opacity': 1 },
    },
  })
  e.push({
    group: 'direction',
    opacity: { 'icon-opacity': 1 },
    spec: {
      id: 'kihonzu_2500_direction',
      type: 'symbol',
      source: T,
      'source-layer': 'kihonzu_2500_direction',
      minzoom: SCALE_SWITCH_ZOOM,
      layout: {
        'icon-image': ['concat', `${DM_SPRITE_ID}:dm-`, ['to-string', ['get', 'Code']]] as never,
        'icon-size': iconSize(14, 0.5, 18, 1) as never,
        'icon-rotate': ICON_ROTATE as never,
        'icon-rotation-alignment': 'map',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
      paint: { 'icon-opacity': 1 },
    },
  })

  e.push({
    group: 'annotation',
    opacity: { 'text-opacity': 1 },
    spec: {
      id: 'kihonzu_2500_annotation',
      type: 'symbol',
      source: T,
      'source-layer': 'kihonzu_2500_annotation',
      minzoom: SCALE_SWITCH_ZOOM,
      layout: {
        'text-field': ['coalesce', ['get', 'Text'], ''] as never,
        'text-font': TEXT_FONT,
        'text-size': ['case', ['in', ['to-number', ['get', 'Code']], ['literal', [7312, 7101]]], 9, 14] as never,
        'text-anchor': 'center',
        'text-offset': [1.5, -1],
        // 都市計画基本図の注記は測量成果として決まった位置に置かれるものなので、
        // 衝突判定で間引かせず全部描く。記号（icon-allow-overlap）と揃える。
        'text-allow-overlap': true,
        'text-rotation-alignment': 'map',
        'text-rotate': TEXT_ROTATE as never,
      },
      paint: {
        'text-color': '#000',
        'text-halo-color': '#fff',
        'text-halo-width': 1.5,
        'text-opacity': 1,
      },
    },
  })

  return e
}

/**
 * 都市計画基本図だけで完結する MapLibre スタイルを組み立てる。
 *
 * ビューワは背景地図を切り替えたりテーマで色を差し替えたりするため、レイヤー定義を
 * コードで組み立てて実行時に注入している。そのままでは QGIS や Maputnik のような
 * 外部ツールに渡せないので、ここで静的なスタイルとして書き出せるようにする。
 * 書き出しは scripts/export-style.mjs から呼ぶ。
 *
 * 背景地図（地理院の最適化ベクトルタイル）は含めない。第三者のスタイルを再配布せず、
 * 単色の背景の上に基本図だけを載せた白図として自己完結させる。
 * グループの表示・不透明度はビューワ側のUIで動かすものなので、既定値（全表示・
 * 不透明度1）で固定する。
 */
export function buildStyle(theme: 'light' | 'dark' = 'light'): StyleSpecification {
  const ink = inkFor(theme)
  const layers: LayerSpecification[] = [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': paperFor(theme) },
    },
    ...buildLayers().map((entry) => {
      const paint = (entry.spec as { paint?: Record<string, unknown> }).paint
      return {
        ...entry.spec,
        // ビューワはこの JSON からレイヤーを読む。パネルのグループ分けと不透明度
        // スライダーの基準値はスタイル仕様に無い情報なので metadata に載せる。
        metadata: { [GROUP_META]: entry.group, [OPACITY_META]: entry.opacity },
        paint: { ...paint, ...inkPaint(entry.spec.type, entry.group, ink) },
      } as LayerSpecification
    }),
  ]
  return {
    version: 8,
    name: `都市計画基本図（${theme === 'dark' ? 'ダーク' : 'ライト'}）`,
    metadata: {
      'dm-converter:generated-by': 'viewer/scripts/export-style.mjs',
      'dm-converter:source': 'viewer/src/layers.ts の buildStyle()',
      'dm-converter:note':
        '生成物。直接編集せず viewer/src/layers.ts を直して書き出し直すこと。',
    },
    glyphs: GLYPHS,
    sprite: [{ id: DM_SPRITE_ID, url: DM_SPRITE_URL }],
    sources: SOURCES,
    layers,
  }
}

/** クリック時のポップアップ本文。DMの属性を日本語見出しで並べる。 */
const ATTR_LABELS: Record<string, string> = {
  Code: '分類コード',
  Elno: '要素識別番号',
  RecordType: 'レコードタイプ',
  DataType: 'データタイプ',
  DataKind: '実データ区分',
  Text: '注記文字列',
  Vnflag: '縦横フラグ',
  Angle: '角度',
  KAKUDO: '角度',
}

/** ポップアップに並べる1件分。クリック地点で重なっている地物ごとに1つ。 */
export interface PopupItem {
  groupName: string
  props: Record<string, unknown>
}

/** 1回のクリックで表示する地物数の上限。これを超えた分は件数だけ知らせる。 */
export const POPUP_MAX_ITEMS = 20

/** 注記文字列に < などが含まれてもポップアップが壊れないようにする。 */
const escapeHtml = (v: unknown): string =>
  String(v).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  )

/**
 * クリック時のポップアップ本文。重なっている地物をすべて並べる。
 * 地物が1件なら見出しはグループ名、複数なら件数を出す。
 */
export function popupHtml(items: PopupItem[], total = items.length): string {
  const row = (label: string, value: unknown): string =>
    `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`

  const section = (item: PopupItem): string => {
    const { groupName, props } = item
    const parts: string[] = []
    // 分類コードの直後に名称を出す。コードだけでは地物種別が分からないため。
    if (props.Code !== undefined && props.Code !== '') {
      parts.push(row(ATTR_LABELS.Code, props.Code))
      parts.push(row('名称', codeName(props.Code) ?? '（標準図式に記載なし）'))
    }
    for (const [k, v] of Object.entries(props)) {
      if (k === 'Code' || v === null || v === undefined || v === '') continue
      parts.push(row(ATTR_LABELS[k] ?? k, v))
    }
    // 複数件のときだけ、どの地物かを見出しで示す。
    const code =
      props.Code === undefined || props.Code === '' ? '' : ` — ${escapeHtml(props.Code)}`
    const head =
      items.length > 1 ? `<h4 class="pop-item-head">${escapeHtml(groupName)}${code}</h4>` : ''
    return `<section class="pop-item">${head}<table class="pop-tbl">${parts.join('')}</table></section>`
  }

  const head =
    items.length > 1
      ? `${total}件の地物${total > items.length ? `（うち${items.length}件を表示）` : ''}`
      : escapeHtml(items[0]?.groupName ?? '')
  return `<div class="pop"><div class="pop-head">${head}</div><div class="pop-body">${items
    .map(section)
    .join('')}</div></div>`
}
