import maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import 'maplibre-gl/dist/maplibre-gl.css'

import { getBasemapStyle, type Basemap } from './basemap'
import {
  GROUPS,
  SOURCES,
  SCALE_SWITCH_ZOOM,
  buildLayers,
  groupOf,
  inkFor,
  popupHtml,
  type GroupKey,
  type LayerEntry,
  type LayerGroup,
} from './layers'
import { applyThemeAttr, initialTheme, type Theme } from './theme'
import './style.css'

let theme: Theme = initialTheme()
let base: Basemap = 'pale'
applyThemeAttr(theme)

const isMobile = window.matchMedia('(max-width: 640px)').matches
const DEBUG = new URLSearchParams(location.search).has('debug')

const protocol = new Protocol()
maplibregl.addProtocol('pmtiles', protocol.tile)

const LAYERS: LayerEntry[] = buildLayers()
const entriesOf = (key: GroupKey): LayerEntry[] => LAYERS.filter((l) => l.group === key)

const map = new maplibregl.Map({
  container: 'map',
  style: await getBasemapStyle(base, theme),
  center: [138.388768, 34.971902],
  zoom: 15.8,
  minZoom: 9,
  maxZoom: 20,
  maxPitch: 85,
  // 地図位置を URL の #ズーム/緯度/経度 に反映（共有・リロード時の位置維持）
  hash: true,
  attributionControl: false,
  // モバイルはGPU/メモリが限られるため保持タイル数と描画解像度を絞る。
  // 逼迫すると WebGL コンテキストが失われ地図がまるごと消えるため、その圧を下げる。
  maxTileCacheSize: isMobile ? 24 : undefined,
  pixelRatio: isMobile ? Math.min(window.devicePixelRatio || 1, 2) : undefined,
})

map.addControl(new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right')
map.addControl(
  new maplibregl.GeolocateControl({
    positionOptions: { enableHighAccuracy: false },
    fitBoundsOptions: { maxZoom: 18 },
    trackUserLocation: true,
    showUserLocation: true,
  }),
  'top-right',
)
map.addControl(new maplibregl.FullscreenControl(), 'top-right')
map.addControl(new maplibregl.ScaleControl({ maxWidth: 200, unit: 'metric' }), 'bottom-left')
map.addControl(new maplibregl.AttributionControl({ compact: true }))

// ---- 診断（?debug で画面表示。実機での原因切り分け用） ----
const diagLog: string[] = []
let ctxLostCount = 0
let hudEl: HTMLElement | null = null

function diag(msg: string): void {
  const line = `${new Date().toISOString().slice(11, 19)} ${msg}`
  diagLog.push(line)
  if (diagLog.length > 8) diagLog.shift()
  console.log('[diag]', line)
  renderHud()
}

function renderHud(): void {
  if (!DEBUG || !hudEl) return
  const rows = GROUPS.filter((g) => g.on)
    .map((g) => {
      const ids = entriesOf(g.key)
        .map((l) => l.spec.id)
        .filter((id) => map.getLayer(id))
      let n = -1
      try {
        n = ids.length ? map.queryRenderedFeatures({ layers: ids }).length : -1
      } catch {
        n = -2
      }
      return `${g.key}: ${n}`
    })
    .join('  ')
  hudEl.innerHTML =
    `<b>build ${__BUILD_TIME__}</b><br>` +
    `zoom ${map.getZoom().toFixed(1)} · base ${base} · mobile ${isMobile} · ctxLost ${ctxLostCount}<br>` +
    `<u>rendered features / group</u><br>${rows || '(none)'}<br>` +
    `<u>log</u><br>${diagLog.join('<br>')}`
}

function initHud(): void {
  if (!DEBUG) return
  hudEl = document.createElement('div')
  hudEl.id = 'diag-hud'
  document.body.append(hudEl)
  renderHud()
  map.on('render', () => {
    if (map.areTilesLoaded()) renderHud()
  })
}

// ---- データ層の投入 ----
// 背景スタイルを差し替えると全レイヤーが消えるため、切替のたびに貼り直す。

function addDataLayers(): void {
  for (const [id, src] of Object.entries(SOURCES)) {
    if (!map.getSource(id)) map.addSource(id, src)
  }
  for (const entry of LAYERS) {
    if (map.getLayer(entry.spec.id)) continue
    const g = groupOf(entry.group)
    map.addLayer({
      ...entry.spec,
      layout: { ...(entry.spec as { layout?: object }).layout, visibility: g.on ? 'visible' : 'none' },
    } as maplibregl.LayerSpecification)
    applyOpacity(entry, g.opacity)
  }
  applyInk()
}

/** 背景の明暗に合わせて基本図の線・文字色を入れ替える。 */
function applyInk(): void {
  const ink = inkFor(theme)
  for (const entry of LAYERS) {
    const id = entry.spec.id
    if (id === 'shizuoka-cs' || !map.getLayer(id)) continue
    switch (entry.spec.type) {
      case 'line':
        map.setPaintProperty(id, 'line-color', ink.line)
        break
      case 'fill':
        map.setPaintProperty(id, 'fill-color', ink.fill)
        break
      case 'symbol':
        if (entry.group === 'annotation') {
          map.setPaintProperty(id, 'text-color', ink.text)
          map.setPaintProperty(id, 'text-halo-color', ink.halo)
        }
        break
    }
  }
}

function applyOpacity(entry: LayerEntry, factor: number): void {
  if (!map.getLayer(entry.spec.id)) return
  for (const [prop, basev] of Object.entries(entry.opacity)) {
    map.setPaintProperty(entry.spec.id, prop, basev * factor)
  }
}

function setGroupVisible(g: LayerGroup, on: boolean): void {
  g.on = on
  for (const entry of entriesOf(g.key)) {
    if (map.getLayer(entry.spec.id)) {
      map.setLayoutProperty(entry.spec.id, 'visibility', on ? 'visible' : 'none')
    }
  }
  const item = layersDiv.querySelector<HTMLElement>(`.layer-item[data-key="${g.key}"]`)
  item?.querySelector<HTMLElement>('.layer-opacity')?.toggleAttribute('hidden', !on)
}

function setGroupOpacity(g: LayerGroup, v: number): void {
  g.opacity = v
  for (const entry of entriesOf(g.key)) applyOpacity(entry, v)
}

// ---- テーマ切替 ----
const themeBtn = document.getElementById('theme-btn') as HTMLButtonElement
const renderThemeBtn = (): void => {
  themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙'
}

// ラスタ（写真）↔ベクタ（標準地図）の切替では diff 適用が効かないため diff:false で
// 完全に再構築する。setStyle 直後は isStyleLoaded() が旧スタイルで true を返して
// 競合するため、新スタイルが落ち着く idle を待ってからデータ層を貼り直す。
async function reloadStyle(): Promise<void> {
  map.setStyle(await getBasemapStyle(base, theme), { diff: false })
  map.once('idle', () => addDataLayers())
}

themeBtn.addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark'
  applyThemeAttr(theme)
  renderThemeBtn()
  void reloadStyle()
})

// ---- パネル開閉 ----
const panel = document.getElementById('panel') as HTMLElement
const collapseBtn = document.getElementById('collapse-btn') as HTMLButtonElement
const renderCollapseBtn = (): void => {
  collapseBtn.textContent = panel.classList.contains('collapsed') ? '▾' : '▴'
}
collapseBtn.addEventListener('click', () => {
  panel.classList.toggle('collapsed')
  renderCollapseBtn()
})

// ---- レイヤートグル ----
const layersDiv = document.getElementById('layers') as HTMLElement

function buildToggles(): void {
  for (const g of GROUPS) {
    const item = document.createElement('div')
    item.className = 'layer-item'
    item.dataset.key = g.key

    const label = document.createElement('label')
    label.className = 'toggle'

    const input = document.createElement('input')
    input.type = 'checkbox'
    input.checked = g.on
    input.addEventListener('change', () => setGroupVisible(g, input.checked))

    const sw = document.createElement('span')
    sw.className = 'switch'
    const text = document.createElement('span')
    text.className = 't-label'
    text.textContent = g.name

    const desc = document.createElement('div')
    desc.className = 'layer-desc'
    desc.hidden = true
    desc.textContent = g.desc

    const info = document.createElement('button')
    info.type = 'button'
    info.className = 'info-btn'
    info.textContent = 'i'
    info.setAttribute('aria-label', `${g.name}の説明`)
    info.setAttribute('aria-expanded', 'false')
    info.addEventListener('click', (ev) => {
      // label 内のボタン。クリックが checkbox のトグルへ波及しないようにする
      ev.preventDefault()
      ev.stopPropagation()
      const open = desc.hidden
      desc.hidden = !open
      info.setAttribute('aria-expanded', String(open))
    })

    label.append(input, sw, text, info)

    const opac = document.createElement('div')
    opac.className = 'layer-opacity'
    opac.hidden = !g.on
    const range = document.createElement('input')
    range.type = 'range'
    range.min = '0'
    range.max = '1'
    range.step = '0.05'
    range.value = String(g.opacity)
    range.setAttribute('aria-label', `${g.name}の不透明度`)
    const val = document.createElement('span')
    val.className = 'op-val'
    val.textContent = `${Math.round(g.opacity * 100)}%`
    range.addEventListener('input', () => {
      const v = Number(range.value)
      val.textContent = `${Math.round(v * 100)}%`
      setGroupOpacity(g, v)
    })
    opac.append(range, val)

    item.append(label, desc, opac)
    layersDiv.append(item)
  }
}

function setAll(on: boolean): void {
  for (const g of GROUPS) {
    if (g.on === on) continue
    const input = layersDiv.querySelector<HTMLInputElement>(`.layer-item[data-key="${g.key}"] input[type=checkbox]`)
    if (input) input.checked = on
    setGroupVisible(g, on)
  }
}
;(document.getElementById('all-on') as HTMLButtonElement).addEventListener('click', () => setAll(true))
;(document.getElementById('all-off') as HTMLButtonElement).addEventListener('click', () => setAll(false))

// ---- 背景地図スイッチャー（右下） ----
class BasemapControl implements maplibregl.IControl {
  private el!: HTMLElement
  onAdd(): HTMLElement {
    this.el = document.createElement('div')
    this.el.className = 'maplibregl-ctrl basemap-switch'
    const defs: [Basemap, string][] = [
      ['pale', '淡色'],
      ['std', '標準'],
      ['photo', '写真'],
      ['blank', '白図'],
    ]
    for (const [b, label] of defs) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.textContent = label
      btn.dataset.base = b
      btn.setAttribute('aria-selected', String(b === base))
      btn.addEventListener('click', () => setBase(b))
      this.el.append(btn)
    }
    return this.el
  }
  onRemove(): void {
    this.el.remove()
  }
  sync(): void {
    for (const btn of this.el.querySelectorAll<HTMLButtonElement>('button')) {
      btn.setAttribute('aria-selected', String(btn.dataset.base === base))
    }
  }
}
const basemapCtrl = new BasemapControl()
map.addControl(basemapCtrl, 'bottom-right')

function setBase(next: Basemap): void {
  if (next === base) return
  base = next
  basemapCtrl.sync()
  void reloadStyle()
}

// ---- 縮尺インジケータ（1/10,000 と 1/2,500 のどちらを見ているか） ----
const scaleBadge = document.getElementById('scale-badge') as HTMLElement
const renderScaleBadge = (): void => {
  scaleBadge.textContent = map.getZoom() >= SCALE_SWITCH_ZOOM ? '1/2,500' : '1/10,000'
}
map.on('zoom', renderScaleBadge)

// ---- ホバーカーソル（マウス環境のみ） ----
const visibleLayerIds = (): string[] =>
  LAYERS.filter((l) => l.group !== 'cs' && groupOf(l.group).on)
    .map((l) => l.spec.id)
    .filter((id) => map.getLayer(id))

if (window.matchMedia('(hover: hover)').matches) {
  map.on('mousemove', (ev) => {
    const ids = visibleLayerIds()
    const hit = ids.length > 0 && map.queryRenderedFeatures(ev.point, { layers: ids }).length > 0
    map.getCanvas().style.cursor = hit ? 'pointer' : ''
  })
}

// ---- クリックポップアップ ----
let popup: maplibregl.Popup | null = null
map.on('click', (ev) => {
  const ids = visibleLayerIds()
  const feats = ids.length ? map.queryRenderedFeatures(ev.point, { layers: ids }) : []
  if (!feats.length) return
  const f = feats[0]
  const entry = LAYERS.find((l) => l.spec.id === f.layer.id)
  const name = entry ? groupOf(entry.group).name : f.layer.id
  if (popup) {
    const old = popup
    popup = null
    old.remove()
  }
  const p = new maplibregl.Popup({ closeButton: true, maxWidth: '320px' })
    .setLngLat(ev.lngLat)
    .setHTML(popupHtml(name, f.properties as Record<string, unknown>))
    .addTo(map)
  p.on('close', () => {
    if (popup === p) popup = null
  })
  popup = p
})

// ---- 初期化 ----
const buildEl = document.getElementById('build-ver')
if (buildEl) buildEl.textContent = `build: ${__BUILD_TIME__}`
renderThemeBtn()
buildToggles()
// スマホでは初期状態でパネルを畳んで地図を広く見せる
if (isMobile) panel.classList.add('collapsed')
renderCollapseBtn()
renderScaleBadge()
map.on('load', addDataLayers)
initHud()

// WebGL コンテキスト消失からの復帰。iOS Safari 等ではメモリ逼迫時に GL コンテキストが
// 失われ、データ層がまるごと消えて戻らないことがある。復帰時に貼り直して自動回復する。
const canvas = map.getCanvas()
canvas.addEventListener(
  'webglcontextlost',
  (ev) => {
    // preventDefault しないと自動復帰イベントが発火しない
    ev.preventDefault()
    ctxLostCount++
    diag('WebGL context lost')
  },
  false,
)
canvas.addEventListener(
  'webglcontextrestored',
  () => {
    diag('WebGL context restored → relayering')
    if (map.isStyleLoaded()) addDataLayers()
    else map.once('idle', addDataLayers)
  },
  false,
)

map.on('error', (ev) => {
  const msg = (ev && (ev as unknown as { error?: Error }).error?.message) || 'map error'
  diag(`error: ${msg}`)
})

// デバッグ/外部連携用にマップを公開
;(window as unknown as { __map: maplibregl.Map }).__map = map

// PWA: Service Worker 登録（本番のみ。dev では HMR を妨げないよう無効）
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
  })
  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return
    refreshing = true
    window.location.reload()
  })
}
