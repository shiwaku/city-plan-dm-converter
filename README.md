# 静岡市 都市計画基本図 on DM

静岡市の都市計画基本図（1/10,000・1/2,500）をベクトルタイル化し、国土地理院の最適化ベクトルタイル（標準地図風）およびCS立体図と重ね合わせて表示するWebマップ。

- **デモ**: https://shiwaku.github.io/city-shizuoka-kihonzu-on-dm/

---

## 使用データ

| データ | ソース | ライセンス |
|--------|--------|-----------|
| 都市計画基本図（1/10,000・1/2,500） | [静岡市オープンデータ](https://data.bodik.jp/dataset/221007_1712212695) | 測量法第44条に基づく承認（承認番号：07静都都第2068号） |
| CS立体図 | [静岡県 CS立体図](https://www.geospatial.jp/ckan/dataset/shizuoka-2023-csmap) | — |
| 最適化ベクトルタイル（標準地図風） | [国土地理院](https://github.com/gsi-cyberjapan/optimal_bvmap) | — |

---

## ファイル構成

```
.
├── index.html              # マップHTML
├── main.js                 # マップ初期化・レイヤー定義
├── style.css               # スタイル
├── std.json                # 最適化ベクトルタイル スタイル定義
├── kihonzu-style.json      # 都市計画基本図 スタイル定義（旧構成、参照用）
├── kihonzu_10000.pmtiles   # ベクトルタイル 1/10,000（z2-z14）
└── kihonzu_2500.pmtiles    # ベクトルタイル 1/2,500（z14-z16）
```

---

## PMTiles 生成フロー

### 使用ツール

| ツール | バージョン | 用途 |
|--------|-----------|------|
| [tippecanoe](https://github.com/felt/tippecanoe) | v2.80.0 | GeoJSON → MBTiles |
| tile-join | v2.80.0 (tippecanoeに同梱) | MBTiles の結合 |
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

#### 1. 1/10,000 スケール MBTiles 生成（2段階）

z2〜z13 は都市骨格レイヤーのみに絞ったフィルタ済み GeoJSON を使用し、z14 は全地物で別途生成後に tile-join でマージする。

**骨格レイヤーの定義**

| ジオメトリ | 対象 Layer コード |
|-----------|----------------|
| 線 | 2101（道路縁）, 2103（分離帯縁線）, 2106（道路橋縁線）, 2301（鉄道中心線）, 2305（地下鉄中心線）, 2306（鉄道橋縁線）, 5101（水部境界線）, 5227（水涯線・河川）, 5228（水涯線・湖池）, 5232（水涯線・海岸）, 5239（一条河川）, 7101（計曲線） |
| 面 | 2101（道路）, 3001〜3003（建物）, 5101（水部境界）, 5232（水涯線・海岸） |

**骨格フィルタ（ogr2ogr）**

```bash
ogr2ogr -f GeoJSON kihonzu_10000_line_skel.geojson 都市計画基本図_10000_線.geojson \
  -where "Layer IN ('2101','2103','2106','2301','2305','2306','5101','5227','5228','5232','5239','7101')"

ogr2ogr -f GeoJSON kihonzu_10000_polygon_skel.geojson 都市計画基本図_10000_面.geojson \
  -where "Layer IN ('2101','3001','3002','3003','5101','5232')"
```

**z2〜z13: 骨格のみ**

```bash
tippecanoe -o kihonzu_10000_skel.mbtiles \
  -Z2 -z13 \
  -M 1000000 \
  -r 1 \
  --drop-densest-as-needed \
  --force \
  -L "kihonzu_10000_line:kihonzu_10000_line_skel.geojson" \
  -L "kihonzu_10000_polygon:kihonzu_10000_polygon_skel.geojson" \
  -L "kihonzu_10000_symbol:都市計画基本図_10000_記号.geojson" \
  -L "kihonzu_10000_annotation:都市計画基本図_10000_注記.geojson"
```

**z14: 全地物**

- ベースズーム: z14（**z14 ではすべての地物を保持**）
- 最大タイルサイズ: 1MB

```bash
tippecanoe -o kihonzu_10000_z14.mbtiles \
  -Z14 -z14 -B14 \
  -M 1000000 \
  --force \
  -L "kihonzu_10000_line:都市計画基本図_10000_線.geojson" \
  -L "kihonzu_10000_polygon:都市計画基本図_10000_面.geojson" \
  -L "kihonzu_10000_symbol:都市計画基本図_10000_記号.geojson" \
  -L "kihonzu_10000_annotation:都市計画基本図_10000_注記.geojson"
```

**tile-join でマージ**

```bash
tile-join -pk -o kihonzu_10000.mbtiles \
  kihonzu_10000_skel.mbtiles \
  kihonzu_10000_z14.mbtiles \
  --force
```

#### 2. 1/2,500 スケール MBTiles 生成

- ズーム範囲: z14〜z16
- ベースズーム: z16（**z16 ではすべての地物を保持**）
- 最大タイルサイズ: 750KB
- z14〜z15 は 750KB を超えないよう密集フィーチャーから自動間引き

```bash
tippecanoe -o kihonzu_2500.mbtiles \
  -Z14 -z16 -B16 \
  -M 750000 \
  --drop-densest-as-needed \
  --force \
  -L "kihonzu_2500_line:都市計画基本図_2500_線.geojson" \
  -L "kihonzu_2500_polygon:都市計画基本図_2500_面.geojson" \
  -L "kihonzu_2500_symbol:都市計画基本図_2500_記号.geojson" \
  -L "kihonzu_2500_annotation:都市計画基本図_2500_注記.geojson"
```

> **GeoJSONのファイル名に日本語が含まれる場合**
> tippecanoe の `-L` オプションが日本語パスを正しく認識しない場合は、シンボリックリンクで英語名にマップしてから実行する。
>
> ```bash
> ln -sf 都市計画基本図_10000_線.geojson    kihonzu_10000_line.geojson
> ln -sf 都市計画基本図_10000_面.geojson    kihonzu_10000_polygon.geojson
> ln -sf 都市計画基本図_10000_記号.geojson  kihonzu_10000_symbol.geojson
> ln -sf 都市計画基本図_10000_注記.geojson  kihonzu_10000_annotation.geojson
> ln -sf 都市計画基本図_2500_線.geojson     kihonzu_2500_line.geojson
> ln -sf 都市計画基本図_2500_面.geojson     kihonzu_2500_polygon.geojson
> ln -sf 都市計画基本図_2500_記号.geojson   kihonzu_2500_symbol.geojson
> ln -sf 都市計画基本図_2500_注記.geojson   kihonzu_2500_annotation.geojson
> ```

#### 3. PMTiles 変換

2つを個別に変換する（結合しない）。
tile-join でマージすると z14 で両データが合算され 750KB を超えるタイルが発生するため、ソースを分離して運用する。

```bash
pmtiles convert kihonzu_10000.mbtiles kihonzu_10000.pmtiles
pmtiles convert kihonzu_2500.mbtiles  kihonzu_2500.pmtiles
```

### タイルサイズ検証

[vt-optimizer](https://github.com/unvt/vt-optimizer-rs) を使用してズームレベル別の統計を確認する。

```bash
vt-optimizer inspect kihonzu_10000.pmtiles --no-progress --report-format json \
  | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('zoom | tiles |   avg    |   max    | 判定')
print('-' * 50)
for item in data['by_zoom']:
    z, s = item['zoom'], item['stats']
    max_kb = s['max_bytes'] / 1024
    flag = 'OK' if max_kb <= 750 else 'NG <<'
    print(f'  {z:>2} | {s[\"tile_count\"]:>5} | {s[\"avg_bytes\"]/1024:>7.1f}KB | {max_kb:>7.1f}KB | {flag}')
"
```

### 生成結果（参考値）

#### kihonzu_10000.pmtiles

z2〜z13 は骨格レイヤーのみ（道路・鉄道・水部・計曲線）、z14 は全地物。

| zoom | タイル数 | 平均サイズ | 最大サイズ |
|-----:|--------:|---------:|---------:|
| 2 | 1 | 389KB | 389KB |
| 3 | 1 | 432KB | 432KB |
| 4 | 1 | 509KB | 509KB |
| 5 | 1 | 650KB | 650KB |
| 6 | 1 | 868KB | 868KB |
| 7 | 1 | 939KB | 939KB |
| 8 | 1 | 747KB | 747KB |
| 9 | 2 | 600KB | 948KB |
| 10 | 4 | 117KB | 416KB |
| 11 | 8 | 112KB | 633KB |
| 12 | 17 | 201KB | 925KB |
| 13 | 47 | 210KB | 792KB |
| 14 | 149 | 135KB | 397KB |

#### kihonzu_2500.pmtiles

| zoom | タイル数 | 平均サイズ | 最大サイズ |
|-----:|--------:|---------:|---------:|
| 14 | 115 | 294KB | 691KB |
| 15 | 391 | 131KB | 334KB |
| 16 | 1393 | 47KB | 139KB |

---

## オプション解説

| オプション | 内容 |
|-----------|------|
| `-Z<n>` | 生成する最小ズームレベル |
| `-z<n>` | 生成する最大ズームレベル |
| `-B<n>` | ベースズーム。このズーム以上ではすべてのフィーチャーを保持する |
| `-M <bytes>` | タイルあたりの最大バイト数。ベースズーム未満のタイルに適用される |
| `-r <rate>` | ズームレベルが1下がるごとのフィーチャー間引き率（デフォルト 2.5）。`-r 1` でズーム間の事前間引きをなくし、タイルサイズのみで制御する |
| `--drop-densest-as-needed` | タイルがサイズ上限・フィーチャー数上限を超えた場合、密集度の高いフィーチャーから間引く |
| `--force` | 出力ファイルが既存でも上書きする |
| `-L "name:file"` | レイヤー名とGeoJSONファイルを指定 |

---

## 設計上の注意点

### なぜ 1/10,000 と 1/2,500 を別 PMTiles にするか

tile-join で2つのMBTilesを結合すると、z14 で両データセットが1枚のタイルに合算される。
各データが個別には 750KB 以下でも、合算後に超過するケースがある（実測: 最大 943KB）。
2つを別 PMTiles・別ソースとして MapLibre に読み込むことで、各タイルリクエストを 750KB 以下に保つ。

### `-r1 --no-feature-limit --no-tile-size-limit` を使わない理由

元の生成コマンドにはこれらのオプションが含まれており、低ズームで最大 5.5MB のタイルが発生していた。
これらを削除し `-M 750000` と `-B<n>` の組み合わせに変更することで、ベースズーム（最詳細表示ズーム）ではフル地物を維持しつつ、低ズームでは自動間引きによるサイズ制御を実現している。
