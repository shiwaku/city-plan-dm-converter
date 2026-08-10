# viewer

静岡市の都市計画基本図（1/10,000・1/2,500）をベクトルタイル化し、国土地理院の最適化ベクトルタイル（淡色地図風・標準地図風）およびCS立体図と重ね合わせて表示するWebマップ。

本ディレクトリは [dm-converter](../README.md) のサブディレクトリです。変換した GeoJSON をベクトルタイル化した結果を確認するためのビューワとして同梱しています。

- **デモ**: https://shiwaku.github.io/dm-converter/

> 旧 `shiwaku/city-plan-dm-viewer` リポジトリを履歴ごと統合したものです（旧URL `https://shiwaku.github.io/city-plan-dm-viewer/` は廃止）。

---

## 機能

| 機能 | 内容 |
|---|---|
| レイヤー切替 | コンバーターの出力区分（面・線・記号・注記）とCS立体図を個別にON/OFF。全ON/全OFFボタンあり |
| 不透明度 | レイヤーごとにスライダーで調整 |
| 凡例・説明 | 各レイヤー直下にインライン凡例。`i` ボタンで説明を開閉 |
| 縮尺表示 | 1/10,000 と 1/2,500 のどちらを見ているかをバッジ表示（ズーム15で自動切替） |
| 背景地図 | 淡色 / 標準（地理院 最適化ベクトルタイル）／ 写真（地理院 全国最新写真）／ 白図（無地）を右下で切替。既定は淡色 |
| テーマ | ライト／ダーク切替。初回はOSの設定に従い、以降は `localStorage` に保存 |
| 属性表示 | 地物クリックでDMの属性（分類コード・要素識別番号・注記文字列など）をポップアップ表示 |
| レスポンシブ | 640px以下ではボトムシート化し、初期状態で畳んで地図を広く見せる |
| PWA | manifest とアイコンを同梱。ホーム画面に追加可能 |
| 診断 | `?debug` を付けるとHUDを表示（ズーム・描画地物数・WebGLコンテキスト消失回数・ログ） |

ダークテーマでは、都市計画基本図の線・文字色を明色に入れ替えます。既定の黒線のままでは暗い背景に埋もれるためです。

---

## 使用データ

| データ | ソース | ライセンス |
|--------|--------|-----------|
| 都市計画基本図（1/10,000・1/2,500） | [静岡市オープンデータ](https://data.bodik.jp/dataset/221007_1712212695) | 測量法第44条に基づく承認（承認番号：07静都都第2068号） |
| CS立体図 | [静岡県 CS立体図](https://www.geospatial.jp/ckan/dataset/shizuoka-2023-csmap) | — |
| 最適化ベクトルタイル（淡色地図風・標準地図風） | [国土地理院](https://github.com/gsi-cyberjapan/optimal_bvmap) | — |

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
    ├── style.css           # スタイル（デザイントークン + パネル）
    └── vite-env.d.ts       # ビルド時定数の型宣言
```

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

## PMTiles 生成フロー

### 使用ツール

| ツール | バージョン | 用途 |
|--------|-----------|------|
| [tippecanoe](https://github.com/felt/tippecanoe) | v2.80.0 | GeoJSON → MBTiles |
| [go-pmtiles](https://github.com/protomaps/go-pmtiles) | v1.30.0 | MBTiles → PMTiles |

### 入力ファイル

```
都市計画基本図_10000_線.geojson      # 1/10,000 線データ
都市計画基本図_10000_面.geojson      # 1/10,000 面データ
都市計画基本図_10000_記号.geojson    # 1/10,000 記号データ
都市計画基本図_10000_注記.geojson    # 1/10,000 注記データ
都市計画基本図_2500_線.geojson       # 1/2,500 線データ
都市計画基本図_2500_面.geojson       # 1/2,500 面データ
都市計画基本図_2500_記号.geojson     # 1/2,500 記号データ
都市計画基本図_2500_注記.geojson     # 1/2,500 注記データ
```

### ビルドコマンド

#### 1. 1/10,000 MBTiles 生成

- ズーム範囲: z2〜z14（表示は z2〜z14.99）
- すべての地物を保持（間引きなし）

```bash
tippecanoe \
  -o kihonzu_10000.mbtiles \
  -Z2 -z14 \
  -r1 \
  --no-feature-limit \
  --no-tile-size-limit \
  --force \
  -L kihonzu_10000_line:都市計画基本図_10000_線.geojson \
  -L kihonzu_10000_polygon:都市計画基本図_10000_面.geojson \
  -L kihonzu_10000_symbol:都市計画基本図_10000_記号.geojson \
  -L kihonzu_10000_annotation:都市計画基本図_10000_注記.geojson
```

#### 2. 1/2,500 MBTiles 生成

- ズーム範囲: z15〜z16（表示は z15〜）
- すべての地物を保持（間引きなし）

```bash
tippecanoe \
  -o kihonzu_2500.mbtiles \
  -Z15 -z16 \
  -r1 \
  --no-feature-limit \
  --no-tile-size-limit \
  --force \
  -L kihonzu_2500_line:都市計画基本図_2500_線.geojson \
  -L kihonzu_2500_polygon:都市計画基本図_2500_面.geojson \
  -L kihonzu_2500_symbol:都市計画基本図_2500_記号.geojson \
  -L kihonzu_2500_annotation:都市計画基本図_2500_注記.geojson
```

#### 3. PMTiles 変換

2つを個別に変換する（結合しない）。

```bash
pmtiles convert kihonzu_10000.mbtiles kihonzu_10000.pmtiles
pmtiles convert kihonzu_2500.mbtiles  kihonzu_2500.pmtiles
```
