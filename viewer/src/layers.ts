import type { LayerSpecification, SourceSpecification } from 'maplibre-gl'
import { DM_SPRITE_ID } from './basemap'
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
    desc: 'DMの線要素（E2）。道路縁・建物外形・等高線など。歩道は破線、等高線と建物は分類コードで描き分けている。',
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
    desc: 'DMの注記要素（E7）。文字列を代表点に配置し、角度属性に従って回転させる。基準点等の注記は1段低いズームから表示する。',
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

// ---- レイヤー定義 ----

export interface LayerEntry {
  group: GroupKey
  spec: LayerSpecification
  /** 不透明度スライダーで操作する paint プロパティと、その基準値。 */
  opacity: Record<string, number>
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

/**
 * 方向要素のうち、スプライトにアイコンが存在する分類コード。
 * 5227（せき）・7212（露岩）・2219（道路のトンネル）は未収録のため除外する。
 * 除外しないと MapLibre が画像の読み込み失敗を毎タイル報告する。
 */
const DIRECTION_CODES = [4219, 5241, 4207, 7213, 4205, 5228, 5226, 3401, 7206]

const CONTOUR_CODES = [7101, 7102, 7103, 7104]
const BUILDING_CODES = [3001, 3002, 3003, 3004]
const SIDEWALK_CODE = 2213
/** 等高線と同じ1段低いズームから出す注記の分類コード（基準点・標高点等）。 */
const KIJUNTEN_CODES = [3001, 3003, 6101, 7301, 7302, 7303, 7304, 7305, 7306, 7307, 7308, 7309, 7311, 7312]

const lineOther = (): unknown[] => [
  'all',
  ['!=', ['to-number', ['get', 'Code']], SIDEWALK_CODE],
  ['!', ['in', ['to-number', ['get', 'Code']], ['literal', CONTOUR_CODES]]],
  ['!', ['in', ['to-number', ['get', 'Code']], ['literal', BUILDING_CODES]]],
]

const iconSize = (z1: number, s1: number, z2: number, s2: number): unknown[] => [
  'interpolate',
  ['linear'],
  ['zoom'],
  z1,
  ['*', s1, ['case', ['==', ['to-string', ['get', 'Code']], '2238'], 0.4, 1.0]],
  z2,
  ['*', s2, ['case', ['==', ['to-string', ['get', 'Code']], '2238'], 0.4, 1.0]],
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
      paint: { 'line-color': '#000000', 'line-width': 0.3 },
    },
  })
  e.push({
    group: 'line',
    opacity: { 'line-opacity': 1 },
    spec: {
      id: 'kihonzu_10000_line_sidewalk',
      type: 'line',
      source: S,
      'source-layer': 'kihonzu_10000_line',
      minzoom: 2,
      maxzoom: SCALE_SWITCH_ZOOM,
      filter: ['==', ['to-number', ['get', 'Code']], SIDEWALK_CODE] as never,
      paint: { 'line-color': '#000000', 'line-width': 0.5, 'line-dasharray': [5, 5] },
    },
  })
  e.push({
    group: 'line',
    opacity: { 'line-opacity': 1 },
    spec: {
      id: 'kihonzu_10000_line_contour',
      type: 'line',
      source: S,
      'source-layer': 'kihonzu_10000_line',
      minzoom: 12,
      maxzoom: SCALE_SWITCH_ZOOM,
      filter: ['in', ['to-number', ['get', 'Code']], ['literal', CONTOUR_CODES]] as never,
      paint: { 'line-color': '#000000', 'line-width': 0.5 },
    },
  })
  e.push({
    group: 'line',
    opacity: { 'line-opacity': 1 },
    spec: {
      id: 'kihonzu_10000_line_building',
      type: 'line',
      source: S,
      'source-layer': 'kihonzu_10000_line',
      minzoom: 13,
      maxzoom: SCALE_SWITCH_ZOOM,
      filter: ['in', ['to-number', ['get', 'Code']], ['literal', BUILDING_CODES]] as never,
      paint: { 'line-color': '#000000', 'line-width': 0.5 },
    },
  })
  e.push({
    group: 'line',
    opacity: { 'line-opacity': 1 },
    spec: {
      id: 'kihonzu_10000_line_other',
      type: 'line',
      source: S,
      'source-layer': 'kihonzu_10000_line',
      minzoom: 2,
      maxzoom: SCALE_SWITCH_ZOOM,
      filter: lineOther() as never,
      paint: { 'line-color': '#000000', 'line-width': 0.5 },
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
      filter: ['in', ['to-number', ['get', 'Code']], ['literal', DIRECTION_CODES]] as never,
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

  for (const [id, minzoom, kijunten] of [
    ['kihonzu_10000_annotation', 13, false],
    ['kihonzu_10000_annotation_kijunten', 12, true],
  ] as [string, number, boolean][]) {
    const inKijunten = ['in', ['to-number', ['get', 'Code']], ['literal', KIJUNTEN_CODES]]
    e.push({
      group: 'annotation',
      opacity: { 'text-opacity': 1 },
      spec: {
        id,
        type: 'symbol',
        source: S,
        'source-layer': 'kihonzu_10000_annotation',
        minzoom,
        maxzoom: SCALE_SWITCH_ZOOM,
        filter: (kijunten ? inKijunten : ['!', inKijunten]) as never,
        layout: {
          'text-field': ['coalesce', ['get', 'Text'], ''] as never,
          'text-font': TEXT_FONT,
          'text-size': 10,
          'text-anchor': 'center',
          'text-offset': [1.5, -1],
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
  }

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
      paint: { 'line-color': '#000000', 'line-width': 0.6 },
    },
  })
  e.push({
    group: 'line',
    opacity: { 'line-opacity': 1 },
    spec: {
      id: 'kihonzu_2500_line_sidewalk',
      type: 'line',
      source: T,
      'source-layer': 'kihonzu_2500_line',
      minzoom: SCALE_SWITCH_ZOOM,
      filter: ['==', ['to-number', ['get', 'Code']], SIDEWALK_CODE] as never,
      paint: { 'line-color': '#000000', 'line-width': 0.5, 'line-dasharray': [5, 5] },
    },
  })
  e.push({
    group: 'line',
    opacity: { 'line-opacity': 1 },
    spec: {
      id: 'kihonzu_2500_line_contour',
      type: 'line',
      source: T,
      'source-layer': 'kihonzu_2500_line',
      minzoom: SCALE_SWITCH_ZOOM,
      filter: ['in', ['to-number', ['get', 'Code']], ['literal', CONTOUR_CODES]] as never,
      paint: { 'line-color': '#000000', 'line-width': 0.5 },
    },
  })
  e.push({
    group: 'line',
    opacity: { 'line-opacity': 1 },
    spec: {
      id: 'kihonzu_2500_line_building',
      type: 'line',
      source: T,
      'source-layer': 'kihonzu_2500_line',
      minzoom: SCALE_SWITCH_ZOOM,
      filter: ['in', ['to-number', ['get', 'Code']], ['literal', BUILDING_CODES]] as never,
      paint: { 'line-color': '#000000', 'line-width': 1 },
    },
  })
  e.push({
    group: 'line',
    opacity: { 'line-opacity': 1 },
    spec: {
      id: 'kihonzu_2500_line_other',
      type: 'line',
      source: T,
      'source-layer': 'kihonzu_2500_line',
      minzoom: SCALE_SWITCH_ZOOM,
      filter: lineOther() as never,
      paint: { 'line-color': '#000000', 'line-width': 1 },
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
      filter: ['in', ['to-number', ['get', 'Code']], ['literal', DIRECTION_CODES]] as never,
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
