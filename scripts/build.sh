#!/usr/bin/env bash
#
# DM → GeoJSON → GeoParquet / PMTiles を一括で生成する。
#
# GeoJSON だけ作り直して GeoParquet や PMTiles が古いまま残ると、
# 配信データと変換結果が食い違う。ここでまとめて焼き直す。
#
# 使い方:
#   scripts/build.sh                    # 1/2,500 と 1/10,000
#   scripts/build.sh 2500               # 縮尺を指定
#   scripts/build.sh 2500 10000 25000
#
# 環境変数:
#   EPSG=6676        入力データの座標参照系（既定: src/index.js の既定値）
#   SKIP_CONVERT=1   DM→GeoJSON を飛ばし、既存の GeoJSON から後段だけ作り直す
#   SKIP_PARQUET=1   GeoParquet を作らない
#   SKIP_TILES=1     MBTiles / PMTiles を作らない
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/output"
SCALES=("$@")
if [ ${#SCALES[@]} -eq 0 ]; then SCALES=(2500 10000); fi

# 地物種別。GeoJSON のファイル名サフィックスと、タイルのレイヤー名の対応。
KINDS=(線:line 面:polygon 記号:symbol 方向:direction 注記:annotation)

have() { command -v "$1" >/dev/null 2>&1; }

# Parquet ドライバを持つ ogr2ogr を探す。
# GDAL は Parquet ドライバを含まないビルドが多い（conda 版・Debian 版とも既定では未収録）。
# WSL 環境では OSGeo4W の Windows 版に収録されているため、そちらへフォールバックする。
OGR=""
OGR_WIN=0

# ドライバ一覧はパイプで grep せず変数に取ってから判定する。
# `cmd | grep -q` は grep が先に終了すると cmd が SIGPIPE で落ち、
# pipefail 下ではパイプライン全体が失敗扱いになる（タイミング依存で再現する）。
has_parquet() {
  local out
  out="$("$1" --formats 2>/dev/null || true)"
  case "$out" in *[Pp]arquet*) return 0 ;; *) return 1 ;; esac
}

find_ogr2ogr() {
  if have ogr2ogr && has_parquet ogr2ogr; then
    OGR="ogr2ogr"; return 0
  fi
  for exe in /mnt/c/OSGeo4W/bin/ogr2ogr.exe /mnt/c/OSGeo4W64/bin/ogr2ogr.exe; do
    if [ -x "$exe" ] && has_parquet "$exe"; then
      OGR="$exe"; OGR_WIN=1; return 0
    fi
  done
  return 1
}

# OSGeo4W の Windows 版を使う場合は Windows 形式のパスを渡す必要がある。
ogr_path() {
  if [ "$OGR_WIN" = "1" ]; then wslpath -w "$1"; else printf '%s' "$1"; fi
}

# 縮尺ごとのズーム範囲。最大ZLは「分解能 ≤ 許容誤差（縮尺 × 図上0.1mm）」を
# 満たす最小のZL。詳細は README「最大ズームレベルの決め方」を参照。
zoom_range() {
  case "$1" in
    2500)  echo "15 16" ;;
    5000)  echo "2 15"  ;;
    10000) echo "2 14"  ;;
    20000) echo "2 13"  ;;
    25000) echo "2 12"  ;;
    *)     echo ""      ;;
  esac
}

log() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }

for SCALE in "${SCALES[@]}"; do
  log "縮尺 1/$SCALE"

  # ---- 1. DM → GeoJSON ----
  if [ "${SKIP_CONVERT:-}" = "1" ]; then
    echo "  DM→GeoJSON をスキップ"
  else
    ARGS=(--scale "$SCALE")
    [ -n "${EPSG:-}" ] && ARGS+=(--epsg "$EPSG")
    if [ ! -d "$ROOT/input/$SCALE" ]; then
      echo "  input/$SCALE/ が無いためスキップ"
      continue
    fi
    node "$ROOT/src/index.js" "${ARGS[@]}"
  fi

  # 以降は生成された GeoJSON が対象
  MISSING=0
  for kv in "${KINDS[@]}"; do
    [ -f "$OUT/都市計画基本図_${SCALE}_${kv%%:*}.geojson" ] || MISSING=1
  done
  if [ "$MISSING" = "1" ]; then
    echo "  GeoJSON が揃っていないため後段をスキップ"
    continue
  fi

  # ---- 2. GeoJSON → GeoParquet ----
  if [ "${SKIP_PARQUET:-}" = "1" ]; then
    echo "  GeoParquet をスキップ"
  elif ! find_ogr2ogr; then
    echo "  Parquet ドライバを持つ ogr2ogr が見つからないため GeoParquet をスキップ"
    echo "  （OSGeo4W をインストールするか、GDAL を Parquet 対応ビルドにしてください）"
  else
    log "GeoParquet 生成 (1/$SCALE)  [$OGR]"
    for kv in "${KINDS[@]}"; do
      SRC="$OUT/都市計画基本図_${SCALE}_${kv%%:*}.geojson"
      DST="${SRC%.geojson}.parquet"
      rm -f "$DST"
      if "$OGR" -f Parquet "$(ogr_path "$DST")" "$(ogr_path "$SRC")"; then
        echo "  $(basename "$DST")"
      else
        echo "  !! $(basename "$DST") の生成に失敗"
      fi
    done
  fi

  # ---- 3. GeoJSON → MBTiles → PMTiles ----
  if [ "${SKIP_TILES:-}" = "1" ]; then
    echo "  タイル生成をスキップ"
    continue
  fi
  if ! have tippecanoe || ! have pmtiles; then
    echo "  tippecanoe / pmtiles が見つからないためタイル生成をスキップ"
    continue
  fi
  RANGE="$(zoom_range "$SCALE")"
  if [ -z "$RANGE" ]; then
    echo "  縮尺 $SCALE のズーム範囲が未定義のためタイル生成をスキップ"
    echo "  （scripts/build.sh の zoom_range に追記してください）"
    continue
  fi
  read -r ZMIN ZMAX <<<"$RANGE"

  log "ベクトルタイル生成 (1/$SCALE, Z$ZMIN-z$ZMAX)"
  LAYER_ARGS=()
  for kv in "${KINDS[@]}"; do
    LAYER_ARGS+=(-L "kihonzu_${SCALE}_${kv##*:}:$OUT/都市計画基本図_${SCALE}_${kv%%:*}.geojson")
  done

  tippecanoe \
    -o "$OUT/kihonzu_${SCALE}.mbtiles" \
    -Z "$ZMIN" -z "$ZMAX" \
    -r1 \
    --no-feature-limit \
    --no-tile-size-limit \
    --force \
    "${LAYER_ARGS[@]}"

  pmtiles convert "$OUT/kihonzu_${SCALE}.mbtiles" "$OUT/kihonzu_${SCALE}.pmtiles"
  echo "  kihonzu_${SCALE}.pmtiles"
done

log "完了"
ls -la "$OUT" | awk 'NR>3 {printf "  %10d  %s\n", $5, $9}'
