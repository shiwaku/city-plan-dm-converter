# 都市計画基本図ビューワ

都市計画基本図（DMデータ）をベクトルタイル化し、国土地理院の最適化ベクトルタイル（淡色地図風・標準地図風）・全国最新写真・白図（無地）から選べる背景の上に表示するWebマップ。表示しているデータは静岡市の1/10,000・1/2,500です。

本ディレクトリは [dm-converter](../README.md) のサブディレクトリです。変換した GeoJSON をベクトルタイル化した結果を確認するためのビューワとして同梱しています。

- **デモ**: https://shiwaku.github.io/dm-converter/

> 旧 `shiwaku/city-plan-dm-viewer` リポジトリを履歴ごと統合したものです（旧URL `https://shiwaku.github.io/city-plan-dm-viewer/` は廃止）。

---

## 機能

| 機能 | 内容 |
|---|---|
| レイヤー切替 | コンバーターの出力区分（面・線・記号・方向・注記）を個別にON/OFF。全ON/全OFFボタンあり |
| 地図記号 | 記号（E5）・方向（E6）は分類コードをキーに [smartcity-dm-sprite](https://github.com/geolonia/smartcity-dm-sprite) のアイコンで描画。方向は `Angle` 属性で回転 |
| 不透明度 | レイヤーごとにスライダーで調整 |
| レイヤー説明 | 各レイヤーの `i` ボタンで説明を開閉 |
| 縮尺表示 | 1/10,000 と 1/2,500 のどちらを見ているかをバッジ表示（ズーム15で自動切替） |
| 背景地図 | 淡色 / 標準（地理院 最適化ベクトルタイル）／ 写真（地理院 全国最新写真）／ 白図（無地）を右下で切替。既定は淡色 |
| テーマ | ライト／ダーク切替。初回はOSの設定に従い、以降は `localStorage` に保存 |
| 属性表示 | 地物クリックでDMの属性をポップアップ表示。分類コードには公共測量標準図式の名称を併記する |
| レスポンシブ | 640px以下ではボトムシート化し、初期状態で畳んで地図を広く見せる |
| PWA | manifest とアイコンを同梱。ホーム画面に追加可能 |
| 診断 | `?debug` を付けるとHUDを表示（ズーム・描画地物数・WebGLコンテキスト消失回数・ログ） |

ダークテーマでは、都市計画基本図の線・文字色を明色に入れ替えます。既定の黒線のままでは暗い背景に埋もれるためです。

---

## 使用データ

| データ | ソース | ライセンス |
|--------|--------|-----------|
| 都市計画基本図（1/10,000・1/2,500） | [静岡市オープンデータ](https://data.bodik.jp/dataset/221007_1712212695) | 測量法第44条に基づく使用承認（承認番号：07静都都第2068号）<br>**使用期間: 2027年1月19日まで** |
| 最適化ベクトルタイル（淡色地図風・標準地図風） | [国土地理院](https://github.com/gsi-cyberjapan/optimal_bvmap) | — |
| 地理院タイル（全国最新写真） | [国土地理院](https://maps.gsi.go.jp/development/ichiran.html) | — |
| smartcity-dm-sprite（地図記号スプライト） | [Geolonia](https://github.com/geolonia/smartcity-dm-sprite) | — |
| 分類コードの名称対応表 | 国土地理院「[作業規程の準則 付録7 公共測量標準図式](https://www.gsi.go.jp/common/000258741.pdf)」 | — |

---

## 開発環境

Node.js が必要です。

リポジトリルートではなく、この `viewer/` ディレクトリで実行します。

```bash
cd viewer
npm install      # 依存パッケージのインストール
npm run dev      # 開発サーバー起動 → http://localhost:5174/
npm run build    # 本番ビルド
```

GitHub Pages へのデプロイは、`viewer/` 配下の変更を main にプッシュすると `.github/workflows/deploy-viewer.yml` により自動実行されます。手動実行する場合は Actions タブから `Deploy viewer to GitHub Pages` を dispatch してください。

### 使用技術

| パッケージ | 用途 |
|-----------|------|
| [Vite](https://vitejs.dev/) | ビルドツール・開発サーバー |
| [MapLibre GL JS](https://maplibre.org/) | ベクトルタイル地図表示 |
| [PMTiles](https://github.com/protomaps/PMTiles) | PMTilesプロトコル対応 |
| TypeScript | 型安全な開発 |

---

## ファイル構成

```
viewer/
├── index.html              # マップHTML
├── package.json            # npm設定
├── package-lock.json
├── tsconfig.json           # TypeScript設定
├── vite.config.ts          # Vite設定（base は /dm-converter/、ビルド時刻の埋め込み）
├── public/
│   ├── pale.json           # 最適化ベクトルタイル スタイル定義（淡色地図風・既定）
│   ├── std.json            # 最適化ベクトルタイル スタイル定義（標準地図風）
│   ├── manifest.webmanifest # PWAマニフェスト
│   ├── icon.svg            # アプリアイコン
│   └── sw.js               # Service Worker（HTMLのみネットワーク優先）
└── src/
    ├── main.ts             # マップ初期化・パネルUI・イベント配線
    ├── layers.ts           # ソース定義・レイヤー定義・凡例・ポップアップ
    ├── basemap.ts          # 背景地図（淡色/標準/写真/白図）とダーク化・スプライト注入
    ├── theme.ts            # テーマの判定と保存
    ├── dmCodes.ts          # 分類コードと名称の対応表（付録7 公共測量標準図式）
    ├── style.css           # スタイル（デザイントークン + パネル）
    └── vite-env.d.ts       # ビルド時定数の型宣言
```

地図記号のスプライトはリポジトリに同梱せず、[smartcity-dm-sprite](https://github.com/geolonia/smartcity-dm-sprite) の GitHub Pages から読み込みます。背景スタイルを切り替えても記号が出るよう、`basemap.ts` がスタイルを返す直前に毎回注入します（地理院スタイル側のスプライトを `default`、追加分を `dm:` 接頭辞で参照）。

PMTilesファイルはレンタルサーバ（`shiworks2.xsrv.jp/shizuoka-city/`）にホスティングしています。GitHub Pages への同梱は、1/2,500 が116MBあり Git の100MBファイル制限を超えるため行っていません。

---

## レイヤー表示設定

### ズームレベルによる切替

| スケール | 表示ズーム範囲 | 備考 |
|---------|-------------|------|
| 1/10,000 | z2〜z14.99 | z15 以上では非表示 |
| 1/2,500  | z15〜      | z15 未満では非表示 |

### 1/10,000 レイヤー一覧

| レイヤーID | 種別 | minzoom | maxzoom |
|-----------|------|--------:|--------:|
| kihonzu_10000_polygon_fill | 面（塗り） | 2 | 15 |
| kihonzu_10000_polygon_outline | 面（輪郭） | 2 | 15 |
| kihonzu_10000_line_sidewalk | 線（歩道: Code 2213） | 2 | 15 |
| kihonzu_10000_line_contour | 線（等高線: Code 7101〜7104） | 12 | 15 |
| kihonzu_10000_line_building | 線（建物: Code 3001〜3004） | 13 | 15 |
| kihonzu_10000_line_other | 線（その他） | 2 | 15 |
| kihonzu_10000_symbol | 記号 | 13 | 15 |
| kihonzu_10000_direction | 方向（角度に従って記号を回転） | 13 | 15 |
| kihonzu_10000_annotation | 注記（基準点等を除く） | 13 | 15 |
| kihonzu_10000_annotation_kijunten | 注記（基準点等） | 12 | 15 |

**基準点等注記（`kihonzu_10000_annotation_kijunten`）の対象 Code**

等高線と同じ z12 から表示する注記。

| Code | 名称 |
|------:|------|
| 3001 | 普通建物 |
| 3003 | 普通無壁舎 |
| 6101 | 人工斜面 |
| 7301 | 三角点 |
| 7302 | 水準点 |
| 7303 | 多角点等 |
| 7304 | 公共基準点（三角点） |
| 7305 | 公共基準点（水準点） |
| 7306 | 公共基準点（多角点等） |
| 7307 | その他の基準点 |
| 7308 | 電子基準点 |
| 7309 | 公共電子基準点 |
| 7311 | 標石を有しない標高点 |
| 7312 | 図化機測定による標高点 |

---

## ベクトルタイル

表示している PMTiles は、リポジトリルートの `scripts/build.sh` で生成しています。生成手順・tippecanoe のオプション・最大ズームレベルの決め方は [ルート README のベクトルタイル作成](../README.md#ベクトルタイル作成参考) を参照してください（ここに手順を写すと二重管理になるため置いていません）。

ビューワが前提としているのは次の2点です。ここを変えるとビューワ側の修正が必要になります。

### タイルのレイヤー名

`kihonzu_<縮尺>_<種別>` の形式です。`src/layers.ts` の `source-layer` がこの名前を直接指しているため、変えるとそのレイヤーは表示されなくなります。

| 変換結果の GeoJSON | タイルのレイヤー名 |
|---|---|
| `都市計画基本図_<縮尺>_線.geojson` | `kihonzu_<縮尺>_line` |
| `都市計画基本図_<縮尺>_面.geojson` | `kihonzu_<縮尺>_polygon` |
| `都市計画基本図_<縮尺>_記号.geojson` | `kihonzu_<縮尺>_symbol` |
| `都市計画基本図_<縮尺>_方向.geojson` | `kihonzu_<縮尺>_direction` |
| `都市計画基本図_<縮尺>_注記.geojson` | `kihonzu_<縮尺>_annotation` |

### ズーム範囲

縮尺ごとに別々の PMTiles を作り、表示側で切り替えます（結合しません）。

| 縮尺 | tippecanoe のズーム範囲 | ビューワでの表示範囲 |
|---|---|---|
| 1/10,000 | `-Z2 -z14` | z2〜z14.99 |
| 1/2,500 | `-Z15 -z16` | z15〜 |
