// キャッシュしない Service Worker。常に最新をネットワークから取得する。
// 「キャッシュ優先」の SW は古い画面を固定してしまうため、有効化時に既存キャッシュを
// すべて削除する。
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      for (const k of await caches.keys()) await caches.delete(k)
      await self.clients.claim()
    })(),
  )
})

// HTML（ナビゲーション）だけネットワーク優先で、HTTPキャッシュもバイパスして取得する。
// GitHub Pages は index.html を Cache-Control: max-age=600 で返すため、通常リロードでは
// 最大10分間 古い index.html（＝古いJS/CSSハッシュを参照）が使われ、修正が反映されない。
// no-store で毎回最新の index.html を取り、常に最新のアセットを読み込ませる。
// ハッシュ付きアセット（index-xxxx.js/css）は不変なので介入せず、ブラウザ既定に任せる。
// PMTiles は Range リクエストで読むため、絶対に介入しない。
self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req, { cache: 'no-store' }).catch(() => fetch(req)))
  }
})
