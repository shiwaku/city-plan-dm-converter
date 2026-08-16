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
| 地図記号 | 記号（E5）・方向（E6）は分類コードをキーに [dm-sprite](https://github.com/shiwaku/dm-sprite) のアイコンで描画。方向は `Angle` 属性で回転 |
| 不透明度 | レイヤーごとにスライダーで調整 |
| レイヤー説明 | 各レイヤーの `i` ボタンで説明を開閉 |
| 縮尺表示 | 1/10,000 と 1/2,500 のどちらを見ているかをバッジ表示（ズーム15で自動切替） |
| 背景地図 | 淡色 / 標準（地理院 最適化ベクトルタイル）／ 写真（地理院 全国最新写真）／ 白図を右下で切替。既定は淡色。**白図は背景なしの無地で、都市計画基本図だけを見るためのモード** |
| テーマ | ライト／ダーク切替。初回はOSの設定に従い、以降は `localStorage` に保存 |
| 属性表示 | 地物クリックでDMの属性をポップアップ表示。分類コードには公共測量標準図式の名称を併記する。タイルには描画に必要な属性（`Code` / `Text` / `Angle`）だけを載せているため、表示されるのはこの範囲になる（[タイルに残す属性](../docs/build-and-tiles.md#タイルに残す属性)を参照） |
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
| 地図記号スプライト | [geolonia/smartcity-dm-sprite](https://github.com/geolonia/smartcity-dm-sprite)（不足6件を追加した fork [shiwaku/dm-sprite](https://github.com/shiwaku/dm-sprite) を参照） | — |
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

### 焼き直したタイルをローカルで確認する

既定では本番の配信先（`shi-works.com`）の PMTiles を読みます。`scripts/build.sh` で焼き直したタイルをマージ前に確認したい場合は、`output/` をローカルで配信し、`VITE_PMTILES_BASE` でそちらを向けます。

```bash
# ターミナル1: output/ を配信（PMTiles は Range リクエストを使うため、対応するサーバが必要）
cd viewer
npx vite ../output --port 8787

# ターミナル2: ビューワをローカルのタイルに向けて起動
cd viewer
VITE_PMTILES_BASE=http://localhost:8787 npm run dev
```

`output/` には `kihonzu_10000.pmtiles` と `kihonzu_2500.pmtiles` の両方が必要です（片方だけ焼き直した場合、もう一方も配置しておく）。Vite の開発サーバは Range リクエストと CORS に対応しているため、追加の設定は不要です。

### WSL でのファイル監視

WSL から Windows 側（`/mnt/c`）のファイルを見る構成では inotify イベントが届かず、既定の監視方法では**ファイルを書き換えても dev サーバが古い変換結果を返し続けます**。`git checkout` でブランチを切り替えても気付かないため、変更したはずのコードが画面に出ません。

`vite.config.ts` で `server.watch.usePolling` を有効にしてポーリング検知にしています。それでも反映されない場合は dev サーバを再起動し、`node_modules/.vite`（変換キャッシュ）を消してください。

配信されているコードが最新かどうかは、dev サーバの返す内容を直接見れば確認できます。

```bash
curl -s http://localhost:5174/src/layers.ts | grep -c LINE_STYLES
```

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
├── scripts/
│   └── export-style.mjs    # 基本図のスタイルを静的JSONへ書き出す
├── public/
│   ├── pale.json           # 最適化ベクトルタイル スタイル定義（淡色地図風・既定）
│   ├── std.json            # 最適化ベクトルタイル スタイル定義（標準地図風）
│   ├── style/              # 書き出した基本図のスタイル（生成物）
│   │   ├── kihonzu-light.json
│   │   └── kihonzu-dark.json
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

地図記号のスプライトはリポジトリに同梱せず、[dm-sprite](https://github.com/shiwaku/dm-sprite) の GitHub Pages から読み込みます。静岡市データで使う記号のうち6コードが本家に無いため、それらを追加した fork を参照しています。背景スタイルを切り替えても記号が出るよう、`basemap.ts` がスタイルを返す直前に毎回注入します（地理院スタイル側のスプライトを `default`、追加分を `dm:` 接頭辞で参照）。

PMTilesファイルは Cloudflare R2（`shi-works.com/_test/`）にホスティングしています。タイルの軽量化（1/2,500 が84MB、1/10,000 が39MB）で Git の100MBファイル制限は下回るようになりましたが、更新のたびに履歴が膨らむため引き続き外部ホスティングにしています。

以前はレンタルサーバ（`shiworks2.xsrv.jp`）で配信していましたが、大容量 PMTiles への Range リクエストがオフセット位置に比例して遅くなる特性があり（実測: ファイル先頭 0.06 秒に対し末尾 3 秒超）、描画が重かったため R2 に移しました。R2 ではオフセットに依らずほぼ一定（0.2〜0.5 秒）です。なお `_test/` は暫定パスで、複数サーバを R2 へ統合する作業の完了後に正式なパスへ差し替えます。

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
| kihonzu_10000_line_solid | 線（実線の分類コード） | 2 | 15 |
| kihonzu_10000_line_dashed | 線（破線の分類コード） | 2 | 15 |
| kihonzu_10000_symbol | 記号 | 13 | 15 |
| kihonzu_10000_direction | 方向（角度に従って記号を回転） | 13 | 15 |
| kihonzu_10000_annotation | 注記 | 13 | 15 |

注記は z13 未満では文字が小さすぎて読めないため表示しません。以前は基準点・標高点等の注記だけ1段低い z12 から出していましたが、そのズームでは読めないため分けるのをやめ、1レイヤーに統合しました。

---

## スタイルの静的JSON

基本図のスタイルは静的な MapLibre スタイルの JSON として持ち、**ビューワもこの JSON を読んで描画します**。外部ツールへ渡すものと画面に出るものが同一ファイルなので、両者が食い違いません。

```
src/layers.ts（buildLayers / buildStyle）
   ↓ npm run export:style（dev / build の前に自動実行）
public/style/kihonzu-{light,dark}.json  ← 生成物
   ↓ import                    ↓ 配信
main.ts（画面表示）        外部ツール
```

レイヤー定義のソースは `src/layers.ts` です。分類コード別の線種（20パターン）や記号の補正倍率を表から `match` 式に展開しているため、JSON を直接書くのではなくコードから生成しています。

```bash
cd viewer
npm run export:style
```

`public/style/kihonzu-light.json` と `kihonzu-dark.json` が生成されます。GitHub Pages にも載るため、次のURLで参照できます。

- https://shiwaku.github.io/dm-converter/style/kihonzu-light.json
- https://shiwaku.github.io/dm-converter/style/kihonzu-dark.json

**この JSON は生成物です。直接編集せず、`src/layers.ts` を直して書き出し直してください。** 書き出し時に `validateStyleMin` でスタイル仕様への適合を検証しており、不正なら書き出しは失敗します。

### 中身

| 含むもの | 含まないもの |
|---|---|
| 単色の背景（白図）、基本図の全14レイヤー、PMTilesのソース定義、グリフとスプライトの参照、測量成果の出典表示 | 背景地図（地理院の最適化ベクトルタイル）。第三者のスタイルを再配布しないため |

グループの表示・不透明度は既定値（全表示・不透明度1）で固定しています。ビューワはこれを起点に、パネルの操作で `visibility` と `*-opacity` を上書きします。

パネルのグループ分けと不透明度スライダーの基準値は MapLibre スタイル仕様に無い情報なので、各レイヤーの `metadata` に載せています。

```json
"metadata": {
  "dm-converter:group": "line",
  "dm-converter:opacity": { "line-opacity": 1 }
}
```

### `pmtiles://` を解せるツールが必要

ソースのURLは `pmtiles://https://.../kihonzu_10000.pmtiles` の形式です。これは MapLibre GL JS に [pmtiles](https://github.com/protomaps/PMTiles) パッケージでプロトコルを登録して初めて解決できるもので、**すべてのツールで開けるわけではありません。**

| ツール | 可否 |
|---|---|
| MapLibre GL JS を使うアプリ（`addProtocol` を登録） | ○ |
| Maputnik | × |
| QGIS | × |

XYZ 配信を挟めば解決します。

```bash
pmtiles serve output --port 8787
# → http://localhost:8787/kihonzu_10000/{z}/{x}/{y}.mvt
```

この場合はソースのURLを差し替える必要があります（書き出しスクリプトにはまだオプションを設けていません）。

### ソース定義だけはコードから読む

`VITE_PMTILES_BASE` は書き出し時に JSON へ焼き込まれるため、ソース定義まで JSON から取ると[焼き直したタイルをローカルで確認する](#焼き直したタイルをローカルで確認する)ができなくなります。そのため**ビューワはレイヤー定義だけを JSON から読み、ソース定義は `src/layers.ts` の `SOURCES`（環境変数対応）から取ります**。

書き出した JSON に入っているソースURLは、書き出しを実行した時点の `VITE_PMTILES_BASE`（未設定なら本番の配信先）です。

### テーマの扱い

色はスタイル側に焼き込まれているため、テーマの切替は `kihonzu-light.json` と `kihonzu-dark.json` の読み替えで行います。実行時に色を差し替える処理は持ちません。背景地図のダーク化は `basemap.ts` 側で別に行っているため、両立します。

### 生成物が古くなるのを防ぐ

`npm run dev` と `npm run build` は `export:style` を先に実行します。`src/layers.ts` を直したのに書き出しを忘れる、という食い違いを防ぐためです。

## ベクトルタイル

表示している PMTiles は、リポジトリルートの `scripts/build.sh` で生成しています。生成手順・tippecanoe のオプション・最大ズームレベルの決め方は [docs/build-and-tiles.md のベクトルタイル作成](../docs/build-and-tiles.md#ベクトルタイル作成参考) を参照してください（ここに手順を写すと二重管理になるため置いていません）。

ビューワが前提としているのは次の3点です。ここを変えるとビューワ側の修正が必要になります。

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

### タイルに載っている属性

タイルサイズを抑えるため、`scripts/build.sh` は描画に必要な属性だけを残しています（`-y Code -y Text -y Angle`）。`src/layers.ts` の式が参照できるのはこの3つだけで、`Elno` などをスタイルやポップアップで使いたくなった場合は `build.sh` の `TILE_ATTRS` に追加してタイルを焼き直す必要があります。

また、低ズームで描かれないフィーチャはタイルから除外しています。上の一覧の `minzoom` と対応させており、建物（Code 3001〜3004）は ZL13未満、等高線（7101〜7104）は ZL12未満、記号・方向・注記はレイヤーごと ZL13未満で落とします。境界が `minzoom` と一致するため線・記号・注記の見た目は変わりませんが、面レイヤは ZL12 以下で建物が描かれなくなります（低ズームでは都市の骨格のみ表示する方針）。**`scripts/build.sh` の閾値と上の一覧は対になっているため、片方を変えたら両方直してください。** 詳細は[docs/build-and-tiles.md の低ズームで描かれないフィーチャの除外](../docs/build-and-tiles.md#低ズームで描かれないフィーチャの除外)を参照してください。
