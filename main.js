const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

const map = new maplibregl.Map({
  container: "map",
  style: "std.json",
  zoom: 15.8,
  minZoom: 2,
  maxZoom: 20,
  center: [138.388768, 34.971902],
  hash: true,
  bearing: 0,
  pitch: 0,
  maxPitch: 85,
  attributionControl: false,
});

map.addControl(new maplibregl.NavigationControl());
map.addControl(new maplibregl.FullscreenControl());
map.addControl(new maplibregl.ScaleControl({ maxWidth: 200, unit: "metric" }));
map.addControl(
  new maplibregl.GeolocateControl({
    positionOptions: { enableHighAccuracy: false },
    fitBoundsOptions: { maxZoom: 18 },
    trackUserLocation: true,
    showUserLocation: true,
  }),
);
map.addControl(
  new maplibregl.AttributionControl({
    compact: true,
    customAttribution:
      '<a href="https://twitter.com/shi__works" target="_blank">X(旧Twitter)</a> | ' +
      '<a href="https://github.com/shiwaku/city-shizuoka-kihonzu-on-dm" target="_blank">GitHub</a> | ',
  }),
);

const csLayerIds = ["shizuoka-cs"];

const kihonzuLayerIds = [
  "kihonzu_10000_polygon_fill",
  "kihonzu_10000_polygon_outline",
  "kihonzu_10000_line_sidewalk",
  "kihonzu_10000_line_contour",
  "kihonzu_10000_line_building",
  "kihonzu_10000_line_other",
  "kihonzu_10000_symbol",
  "kihonzu_10000_annotation",
  "kihonzu_10000_annotation_kijunten",
  "kihonzu_2500_polygon_fill",
  "kihonzu_2500_polygon_outline",
  "kihonzu_2500_line_sidewalk",
  "kihonzu_2500_line_contour",
  "kihonzu_2500_line_building",
  "kihonzu_2500_line_other",
  "kihonzu_2500_symbol",
  "kihonzu_2500_annotation",
];

map.on("load", () => {
  // kihonzuシンボル用スプライトを追加
  map.addSprite("dm", "https://geolonia.github.io/smartcity-dm-sprite/sprite");

  // CS立体図ソース
  map.addSource("shizuoka-cs", {
    type: "raster",
    tiles: [
      "https://shiworks.xsrv.jp/raster-tiles/pref-shizuoka/shizuoka-cs-tiles/{z}/{x}/{y}.png",
    ],
    attribution:
      "<a href='https://www.geospatial.jp/ckan/dataset/shizuoka-2023-csmap' target='_blank'>静岡県CS立体図</a>",
    tileSize: 256,
  });

  // 都市計画基本図ソース（1/10000: z2-z14）
  map.addSource("kihonzu", {
    type: "vector",
    url: "pmtiles://https://pmtiles-data.s3.ap-northeast-1.amazonaws.com/city-shizuoka/kihonzu_10000.pmtiles",
    attribution:
      '<a href="https://data.bodik.jp/dataset/221007_1712212695" target="_blank">測量法第44条に基づき、静岡市長の承認を得て1/2,500および1/10,000都市計画基本図を加工して作成（承認番号：07静都都第2068号）</a>',
  });

  // 都市計画基本図ソース（1/2500: z14-z16）
  map.addSource("kihonzu_2500", {
    type: "vector",
    url: "pmtiles://https://pmtiles-data.s3.ap-northeast-1.amazonaws.com/city-shizuoka/kihonzu_2500.pmtiles",
    attribution:
      '<a href="https://data.bodik.jp/dataset/221007_1712212695" target="_blank">測量法第44条に基づき、静岡市長の承認を得て1/2,500および1/10,000都市計画基本図を加工して作成（承認番号：07静都都第2068号）</a>',
  });

  // CS立体図レイヤー
  map.addLayer({
    id: "shizuoka-cs",
    type: "raster",
    source: "shizuoka-cs",
    layout: { visibility: "visible" },
    paint: { "raster-opacity": 1 },
  });

  // 都市計画基本図レイヤー（1/10000）
  map.addLayer({
    id: "kihonzu_10000_polygon_fill",
    type: "fill",
    source: "kihonzu",
    "source-layer": "kihonzu_10000_polygon",
    minzoom: 2,
    maxzoom: 15,
    layout: { visibility: "visible" },
    paint: {
      "fill-color": "#ffffff",
      "fill-opacity": 0.3,
    },
  });

  map.addLayer({
    id: "kihonzu_10000_polygon_outline",
    type: "line",
    source: "kihonzu",
    "source-layer": "kihonzu_10000_polygon",
    minzoom: 2,
    maxzoom: 15,
    layout: { visibility: "visible" },
    paint: {
      "line-color": "#000000",
      "line-width": 0.3,
    },
  });

  map.addLayer({
    id: "kihonzu_10000_line_sidewalk",
    type: "line",
    source: "kihonzu",
    "source-layer": "kihonzu_10000_line",
    minzoom: 2,
    maxzoom: 15,
    filter: ["==", ["to-number", ["get", "Layer"]], 2213],
    layout: { visibility: "visible" },
    paint: {
      "line-color": "#000000",
      "line-width": 0.5,
      "line-dasharray": [5, 5],
    },
  });

  map.addLayer({
    id: "kihonzu_10000_line_contour",
    type: "line",
    source: "kihonzu",
    "source-layer": "kihonzu_10000_line",
    minzoom: 12,
    maxzoom: 15,
    filter: [
      "in",
      ["to-number", ["get", "Layer"]],
      ["literal", [7101, 7102, 7103, 7104]],
    ],
    layout: { visibility: "visible" },
    paint: {
      "line-color": "#000000",
      "line-width": 0.5,
    },
  });

  map.addLayer({
    id: "kihonzu_10000_line_building",
    type: "line",
    source: "kihonzu",
    "source-layer": "kihonzu_10000_line",
    minzoom: 13,
    maxzoom: 15,
    filter: [
      "in",
      ["to-number", ["get", "Layer"]],
      ["literal", [3001, 3002, 3003, 3004]],
    ],
    layout: { visibility: "visible" },
    paint: {
      "line-color": "#000000",
      "line-width": 0.5,
    },
  });

  map.addLayer({
    id: "kihonzu_10000_line_other",
    type: "line",
    source: "kihonzu",
    "source-layer": "kihonzu_10000_line",
    minzoom: 2,
    maxzoom: 15,
    filter: [
      "all",
      ["!=", ["to-number", ["get", "Layer"]], 2213],
      ["!", ["in", ["to-number", ["get", "Layer"]], ["literal", [7101, 7102, 7103, 7104]]]],
      ["!", ["in", ["to-number", ["get", "Layer"]], ["literal", [3001, 3002, 3003, 3004]]]],
    ],
    layout: { visibility: "visible" },
    paint: {
      "line-color": "#000000",
      "line-width": 0.5,
    },
  });

  map.addLayer({
    id: "kihonzu_10000_symbol",
    type: "symbol",
    source: "kihonzu",
    "source-layer": "kihonzu_10000_symbol",
    minzoom: 13,
    maxzoom: 15,
    layout: {
      "icon-image": [
        "concat",
        "dm:dm-",
        ["to-string", ["get", "Layer"]],
      ],
      "icon-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        13,
        [
          "*",
          0.5,
          ["case", ["==", ["to-string", ["get", "Layer"]], "2238"], 0.4, 1.0],
        ],
        14,
        [
          "*",
          0.75,
          ["case", ["==", ["to-string", ["get", "Layer"]], "2238"], 0.4, 1.0],
        ],
      ],
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
      "visibility": "visible",
    },
  });

  map.addLayer({
    id: "kihonzu_10000_annotation",
    type: "symbol",
    source: "kihonzu",
    "source-layer": "kihonzu_10000_annotation",
    minzoom: 13,
    maxzoom: 15,
    filter: [
      "!",
      ["in", ["to-number", ["get", "Layer"]], ["literal", [3001, 3003, 6101, 7301, 7302, 7303, 7304, 7305, 7306, 7307, 7308, 7309, 7311, 7312]]],
    ],
    layout: {
      "text-field": ["coalesce", ["get", "Text"], ""],
      "text-size": 10,
      "text-anchor": "center",
      "text-offset": [1.5, -1],
      "text-rotation-alignment": "map",
      "text-rotate": [
        "let",
        "a",
        ["coalesce", ["to-number", ["get", "KAKUDO"]], 0],
        [
          "case",
          ["any", ["==", ["var", "a"], 90], ["==", ["var", "a"], -90]],
          0,
          ["*", -1, ["var", "a"]],
        ],
      ],
      "visibility": "visible",
    },
    paint: {
      "text-color": "#000",
      "text-halo-color": "#fff",
      "text-halo-width": 1.5,
    },
  });

  // 都市計画基本図レイヤー（1/10000 基準点注記）
  map.addLayer({
    id: "kihonzu_10000_annotation_kijunten",
    type: "symbol",
    source: "kihonzu",
    "source-layer": "kihonzu_10000_annotation",
    minzoom: 12,
    maxzoom: 15,
    filter: [
      "in", ["to-number", ["get", "Layer"]], ["literal", [3001, 3003, 6101, 7301, 7302, 7303, 7304, 7305, 7306, 7307, 7308, 7309, 7311, 7312]],
    ],
    layout: {
      "text-field": ["coalesce", ["get", "Text"], ""],
      "text-size": 10,
      "text-anchor": "center",
      "text-offset": [1.5, -1],
      "text-rotation-alignment": "map",
      "text-rotate": [
        "let",
        "a",
        ["coalesce", ["to-number", ["get", "KAKUDO"]], 0],
        [
          "case",
          ["any", ["==", ["var", "a"], 90], ["==", ["var", "a"], -90]],
          0,
          ["*", -1, ["var", "a"]],
        ],
      ],
      "visibility": "visible",
    },
    paint: {
      "text-color": "#000",
      "text-halo-color": "#fff",
      "text-halo-width": 1.5,
    },
  });

  // 都市計画基本図レイヤー（1/2500）
  map.addLayer({
    id: "kihonzu_2500_polygon_fill",
    type: "fill",
    source: "kihonzu_2500",
    "source-layer": "kihonzu_2500_polygon",
    minzoom: 15,
    layout: { visibility: "visible" },
    paint: {
      "fill-color": "#ffffff",
      "fill-opacity": 0.25,
    },
  });

  map.addLayer({
    id: "kihonzu_2500_polygon_outline",
    type: "line",
    source: "kihonzu_2500",
    "source-layer": "kihonzu_2500_polygon",
    minzoom: 15,
    layout: { visibility: "visible" },
    paint: {
      "line-color": "#000000",
      "line-width": 0.6,
    },
  });

  map.addLayer({
    id: "kihonzu_2500_line_sidewalk",
    type: "line",
    source: "kihonzu_2500",
    "source-layer": "kihonzu_2500_line",
    minzoom: 15,
    filter: ["==", ["to-number", ["get", "Layer"]], 2213],
    layout: { visibility: "visible" },
    paint: {
      "line-color": "#000000",
      "line-width": 0.5,
      "line-dasharray": [5, 5],
    },
  });

  map.addLayer({
    id: "kihonzu_2500_line_contour",
    type: "line",
    source: "kihonzu_2500",
    "source-layer": "kihonzu_2500_line",
    minzoom: 15,
    filter: [
      "in",
      ["to-number", ["get", "Layer"]],
      ["literal", [7101, 7102, 7103, 7104]],
    ],
    layout: { visibility: "visible" },
    paint: {
      "line-color": "#000000",
      "line-width": 0.5,
    },
  });

  map.addLayer({
    id: "kihonzu_2500_line_building",
    type: "line",
    source: "kihonzu_2500",
    "source-layer": "kihonzu_2500_line",
    minzoom: 15,
    filter: [
      "in",
      ["to-number", ["get", "Layer"]],
      ["literal", [3001, 3002, 3003, 3004]],
    ],
    layout: { visibility: "visible" },
    paint: {
      "line-color": "#000000",
      "line-width": 1,
    },
  });

  map.addLayer({
    id: "kihonzu_2500_line_other",
    type: "line",
    source: "kihonzu_2500",
    "source-layer": "kihonzu_2500_line",
    minzoom: 15,
    filter: [
      "all",
      ["!=", ["to-number", ["get", "Layer"]], 2213],
      ["!", ["in", ["to-number", ["get", "Layer"]], ["literal", [7101, 7102, 7103, 7104]]]],
      ["!", ["in", ["to-number", ["get", "Layer"]], ["literal", [3001, 3002, 3003, 3004]]]],
    ],
    layout: { visibility: "visible" },
    paint: {
      "line-color": "#000000",
      "line-width": 1,
    },
  });

  map.addLayer({
    id: "kihonzu_2500_symbol",
    type: "symbol",
    source: "kihonzu_2500",
    "source-layer": "kihonzu_2500_symbol",
    minzoom: 15,
    layout: {
      "icon-image": [
        "concat",
        "dm:dm-",
        ["to-string", ["get", "Layer"]],
      ],
      "icon-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        14,
        [
          "*",
          0.5,
          ["case", ["==", ["to-string", ["get", "Layer"]], "2238"], 0.4, 1.0],
        ],
        18,
        [
          "*",
          1,
          ["case", ["==", ["to-string", ["get", "Layer"]], "2238"], 0.4, 1.0],
        ],
      ],
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
      "visibility": "visible",
    },
  });

  map.addLayer({
    id: "kihonzu_2500_annotation",
    type: "symbol",
    source: "kihonzu_2500",
    "source-layer": "kihonzu_2500_annotation",
    minzoom: 15,
    layout: {
      "text-field": ["coalesce", ["get", "Text"], ""],
      "text-size": [
        "case",
        ["in", ["to-number", ["get", "Layer"]], ["literal", [7312, 7101]]],
        9,
        14,
      ],
      "text-anchor": "center",
      "text-offset": [1.5, -1],
      "text-rotation-alignment": "map",
      "text-rotate": [
        "let",
        "a",
        ["coalesce", ["to-number", ["get", "KAKUDO"]], 0],
        [
          "case",
          ["any", ["==", ["var", "a"], 90], ["==", ["var", "a"], -90]],
          0,
          ["*", -1, ["var", "a"]],
        ],
      ],
      "visibility": "visible",
    },
    paint: {
      "text-color": "#000",
      "text-halo-color": "#fff",
      "text-halo-width": 1.5,
    },
  });

  // レイヤー切替イベント
  document.getElementById("toggle-cs").addEventListener("change", (e) => {
    const visibility = e.target.checked ? "visible" : "none";
    csLayerIds.forEach((id) => map.setLayoutProperty(id, "visibility", visibility));
  });

  document.getElementById("toggle-kihonzu").addEventListener("change", (e) => {
    const visibility = e.target.checked ? "visible" : "none";
    kihonzuLayerIds.forEach((id) => map.setLayoutProperty(id, "visibility", visibility));
  });
});
