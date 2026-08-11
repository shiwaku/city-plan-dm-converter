// -----------------------------------------
// QGIS レイヤスタイル（.qml）生成スクリプト
//
// 記号（E5）・方向（E6）・注記（E7）は代表点のポイントとして出力されるため、
// QGIS に素で読み込むと属性の無い点が並ぶだけになる。それぞれに合ったスタイル
// （分類コードごとの地図記号、角度による回転、注記のラベル表示）を当てる .qml を
// qgis/ に書き出す。
//
// 使い方:
//   node scripts/make-qgis-styles.js                    # output/*.geojson から分類コードを収集
//   node scripts/make-qgis-styles.js --codes 3509,4201  # 記号のコードを直接指定
//
// 地図記号は qgis/symbols/dm-<コード>.svg（ビューワと同じ smartcity-dm-sprite の
// アイコン）を QML に base64 で埋め込む。埋め込むことで、SVGパスの設定なしに
// .qml 単体で記号が表示される。アイコンが無いコードは色付きの丸で代替する。
//
// カテゴリは実データに出現する分類コードから作る。他自治体のデータで
// 作り直す場合は、そのデータを変換したうえで再実行する。
// -----------------------------------------
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'qgis');
const ICON_DIR = path.join(OUT_DIR, 'symbols');
const QGIS_VERSION = '3.34.0-Prizren';

// ---- 分類コード名称（ビューワと同じ対応表を使う） ----

function loadCodeNames() {
  const src = fs.readFileSync(path.join(ROOT, 'viewer/src/dmCodes.ts'), 'utf8');
  const names = {};
  for (const m of src.matchAll(/'(\d{4})':\s*'([^']*)'/g)) {
    names[m[1]] = m[2];
  }
  if (Object.keys(names).length === 0) {
    throw new Error('viewer/src/dmCodes.ts から分類コードを読み取れませんでした');
  }
  return names;
}

/** 分類コードに対応する地図記号を base64 で返す。無ければ null。 */
function loadIcon(code) {
  const file = path.join(ICON_DIR, `dm-${code}.svg`);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file).toString('base64');
}

// ---- カテゴリに使う分類コードの収集 ----

function codesFromArgs() {
  const i = process.argv.indexOf('--codes');
  if (i === -1 || !process.argv[i + 1]) return null;
  return process.argv[i + 1].split(',').map((s) => s.trim()).filter(Boolean);
}

/** output/ の GeoJSON から分類コードを集める。suffix は '_記号.geojson' など。 */
function codesFromOutput(suffix) {
  const dir = path.join(ROOT, 'output');
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(suffix));
  const found = new Set();
  for (const f of files) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const m of text.matchAll(/"Code":"(\d+)"/g)) found.add(m[1]);
  }
  return [...found].sort();
}

// ---- 色（アイコンが無いコードの代替マーカー用） ----

/** カテゴリ数に応じて色相を等間隔に振り、明度・彩度を交互に変えて隣接色を見分けやすくする。 */
function categoryColor(index, total) {
  const h = (index * 360) / Math.max(total, 1);
  const s = index % 2 === 0 ? 0.75 : 0.55;
  const v = index % 3 === 0 ? 0.85 : 0.65;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const seg = Math.floor(h / 60) % 6;
  const rgb = [
    [c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x],
  ][seg];
  return rgb.map((n) => Math.round((n + m) * 255)).join(',') + ',255';
}

// ---- QML 部品 ----

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** 式で駆動するプロパティ（マーカー角度など）。 */
function ddProperties(props, indent = '        ') {
  const entries = Object.entries(props)
    .map(
      ([key, expr]) => `${indent}    <Option name="${key}" type="Map">
${indent}      <Option name="active" type="bool" value="true"/>
${indent}      <Option name="expression" type="QString" value="${esc(expr)}"/>
${indent}      <Option name="type" type="int" value="3"/>
${indent}    </Option>`,
    )
    .join('\n');
  return `${indent}<data_defined_properties>
${indent}  <Option type="Map">
${indent}    <Option name="name" type="QString" value=""/>
${indent}    <Option name="properties" type="Map">
${entries}
${indent}    </Option>
${indent}    <Option name="type" type="QString" value="collection"/>
${indent}  </Option>
${indent}</data_defined_properties>`;
}

function wrapSymbol(name, layer) {
  return `    <symbol name="${name}" type="marker" alpha="1" clip_to_extent="1" force_rhr="0" frame_rate="10" is_animated="0">
${layer}
    </symbol>`;
}

/** SVG マーカー。SVG は base64 で埋め込むため、外部ファイルへのパス解決が不要。 */
function svgMarker(name, { base64, size = '4', dd = null }) {
  const layer = `      <layer class="SvgMarker" enabled="1" locked="0" pass="0">
        <Option type="Map">
          <Option name="angle" type="QString" value="0"/>
          <Option name="color" type="QString" value="0,0,0,255"/>
          <Option name="fixedAspectRatio" type="QString" value="0"/>
          <Option name="horizontal_anchor_point" type="QString" value="1"/>
          <Option name="name" type="QString" value="base64:${base64}"/>
          <Option name="offset" type="QString" value="0,0"/>
          <Option name="offset_unit" type="QString" value="MM"/>
          <Option name="outline_color" type="QString" value="0,0,0,255"/>
          <Option name="outline_width" type="QString" value="0"/>
          <Option name="outline_width_unit" type="QString" value="MM"/>
          <Option name="scale_method" type="QString" value="diameter"/>
          <Option name="size" type="QString" value="${size}"/>
          <Option name="size_unit" type="QString" value="MM"/>
          <Option name="vertical_anchor_point" type="QString" value="1"/>
        </Option>
${dd ? dd + '\n' : ''}      </layer>`;
  return wrapSymbol(name, layer);
}

function simpleMarker(name, { shape, color, size, outline = '35,35,35,255', outlineWidth = '0', dd = null }) {
  const layer = `      <layer class="SimpleMarker" enabled="1" locked="0" pass="0">
        <Option type="Map">
          <Option name="angle" type="QString" value="0"/>
          <Option name="cap_style" type="QString" value="square"/>
          <Option name="color" type="QString" value="${color}"/>
          <Option name="horizontal_anchor_point" type="QString" value="1"/>
          <Option name="joinstyle" type="QString" value="bevel"/>
          <Option name="name" type="QString" value="${shape}"/>
          <Option name="offset" type="QString" value="0,0"/>
          <Option name="offset_unit" type="QString" value="MM"/>
          <Option name="outline_color" type="QString" value="${outline}"/>
          <Option name="outline_style" type="QString" value="solid"/>
          <Option name="outline_width" type="QString" value="${outlineWidth}"/>
          <Option name="outline_width_unit" type="QString" value="MM"/>
          <Option name="scale_method" type="QString" value="diameter"/>
          <Option name="size" type="QString" value="${size}"/>
          <Option name="size_unit" type="QString" value="MM"/>
          <Option name="vertical_anchor_point" type="QString" value="1"/>
        </Option>
${dd ? dd + '\n' : ''}      </layer>`;
  return wrapSymbol(name, layer);
}

function qml({ header, renderer, labeling = '' }) {
  return `<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>
<!--
  ${header}
  dm-converter (https://github.com/shiwaku/dm-converter) が生成。
  scripts/make-qgis-styles.js で作り直せる。手で編集した内容は次回生成時に失われる。
-->
<qgis version="${QGIS_VERSION}" styleCategories="Symbology|Labeling" labelsEnabled="${labeling ? 1 : 0}">
${renderer}
${labeling}</qgis>
`;
}

/** 分類コードでカテゴリ分けするレンダラ。makeSymbol(code, index) が symbol XML を返す。 */
function categorizedRenderer(codes, names, makeSymbol, fallbackSymbol) {
  const categories = codes
    .map((code, i) => {
      const label = names[code] ? `${code} ${names[code]}` : code;
      return `      <category render="true" value="${code}" symbol="${i}" label="${esc(label)}"/>`;
    })
    .join('\n');
  const symbols = codes.map((code, i) => makeSymbol(code, i)).join('\n');
  const other = codes.length;

  return `  <renderer-v2 type="categorizedSymbol" attr="Code" forceraster="0" symbollevels="0" enableorderby="0" referencescale="-1">
    <categories>
${categories}
      <category render="true" value="" symbol="${other}" label="その他"/>
    </categories>
    <symbols>
${symbols}
${fallbackSymbol(String(other))}
    </symbols>
  </renderer-v2>`;
}

// ---- 記号（E5）: 分類コードごとの地図記号 ----

function symbolStyle(codes, names) {
  let withIcon = 0;
  const make = (code, i) => {
    const base64 = loadIcon(code);
    if (base64) {
      withIcon++;
      return svgMarker(String(i), { base64, size: '4' });
    }
    // スプライトに無いコードは色付きの丸で代替する（凡例で名称は分かる）
    return simpleMarker(String(i), { shape: 'circle', color: categoryColor(i, codes.length), size: '2.4' });
  };
  const fallback = (name) => simpleMarker(name, { shape: 'circle', color: '150,150,150,255', size: '2.0' });

  const renderer = categorizedRenderer(codes, names, make, fallback);
  const style = qml({
    header: `都市計画基本図 記号（E5）: 分類コード ${codes.length} 種（うち ${withIcon} 種は地図記号）`,
    renderer,
  });
  return { style, withIcon };
}

// ---- 方向（E6）: 分類コードごとの地図記号を Angle で回転 ----

// スプライトのアイコンは右（東）向きに描かれている。QGIS のマーカー回転は時計回り、
// Angle は東を0度とする反時計回りのため、符号を反転するだけでよい。
const SVG_ROTATION = '0 - to_real("Angle")';
// 代替の三角マーカーは角度0で上（北）を向くため、90 から引いて読み替える。
const TRIANGLE_ROTATION = '90 - to_real("Angle")';

function directionStyle(codes, names) {
  const triangle = (name) =>
    simpleMarker(name, {
      shape: 'triangle',
      color: '227,26,28,255',
      size: '3.0',
      outlineWidth: '0.2',
      dd: ddProperties({ angle: TRIANGLE_ROTATION }),
    });

  if (codes.length === 0) {
    // 方向の実データが無い場合は、分類コードが分からないため単一シンボルにする。
    const renderer = `  <renderer-v2 type="singleSymbol" forceraster="0" symbollevels="0" enableorderby="0" referencescale="-1">
    <symbols>
${triangle('0')}
    </symbols>
  </renderer-v2>`;
    return { style: qml({ header: '都市計画基本図 方向（E6）: Angle 属性で記号を回転', renderer }), withIcon: 0 };
  }

  let withIcon = 0;
  const make = (code, i) => {
    const base64 = loadIcon(code);
    if (base64) {
      withIcon++;
      return svgMarker(String(i), { base64, size: '4.5', dd: ddProperties({ angle: SVG_ROTATION }) });
    }
    return triangle(String(i));
  };

  const renderer = categorizedRenderer(codes, names, make, triangle);
  const style = qml({
    header: `都市計画基本図 方向（E6）: 分類コード ${codes.length} 種を Angle 属性で回転（うち ${withIcon} 種は地図記号）`,
    renderer,
  });
  return { style, withIcon };
}

// ---- 注記（E7）: Text をラベル表示 ----

function annotationStyle() {
  const renderer = `  <renderer-v2 type="singleSymbol" forceraster="0" symbollevels="0" enableorderby="0" referencescale="-1">
    <symbols>
${simpleMarker('0', { shape: 'circle', color: '120,120,120,255', size: '0.8' })}
    </symbols>
  </renderer-v2>`;

  // QGIS のラベル回転は反時計回りで、Angle と同じ向き。縦書き（Vnflag=1）は
  // 文字送りの向きで表現するため、角度は 0 に倒す（ビューワの扱いと揃える）。
  const rotation = 'CASE WHEN abs(to_real("Angle")) = 90 THEN 0 ELSE to_real("Angle") END';
  const orientation = `CASE WHEN "Vnflag" = '1' THEN 'vertical' ELSE 'horizontal' END`;

  const labeling = `  <labeling type="simple">
    <settings calloutType="simple">
      <text-style fieldName="Text" isExpression="0" fontSize="9" fontSizeUnit="Point" textColor="0,0,0,255"
                  textOrientation="horizontal" multilineHeight="1" allowHtml="0" blendMode="0" fontStrikeout="0"
                  fontUnderline="0" fontItalic="0" fontWeight="50" textOpacity="1">
        <text-buffer bufferDraw="1" bufferSize="0.8" bufferSizeUnits="MM" bufferColor="255,255,255,255"
                     bufferOpacity="1" bufferJoinStyle="128" bufferNoFill="0" bufferBlendMode="0"/>
        <background shapeDraw="0"/>
        <shadow shadowDraw="0"/>
      </text-style>
      <text-format placeDirectionSymbol="0" multilineAlign="1" wrapChar="" useMaxLineLengthForAutoWrap="1"
                   autoWrapLength="0" decimals="3" formatNumbers="0" plussign="0" addDirectionSymbol="0"/>
      <placement placement="1" offsetType="0" quadOffset="4" xOffset="0" yOffset="0" offsetUnits="MM"
                 rotationAngle="0" preserveRotation="1" dist="0" distUnits="MM" priority="5"
                 overlapHandling="AllowOverlapIfRequired"/>
      <rendering drawLabels="1" scaleVisibility="0" fontMinPixelSize="3" fontMaxPixelSize="10000"
                 displayAll="1" upsidedownLabels="0" labelPerPart="0" mergeLines="0" obstacle="0"/>
${ddProperties({ LabelRotation: rotation, TextOrientation: orientation }, '      ')}
    </settings>
  </labeling>
`;

  return qml({ header: '都市計画基本図 注記（E7）: Text をラベル表示し Angle / Vnflag で向きを再現', renderer, labeling });
}

// ---- 実行 ----

function main() {
  const names = loadCodeNames();
  const symbolCodes = codesFromArgs() || codesFromOutput('_記号.geojson');
  const directionCodes = codesFromOutput('_方向.geojson');

  if (symbolCodes.length === 0) {
    console.error('記号の分類コードが集められませんでした。');
    console.error('output/*_記号.geojson を生成してから実行するか、--codes 3509,4201 のように指定してください。');
    process.exit(1);
  }
  if (!fs.existsSync(ICON_DIR)) {
    console.error(`地図記号が見つかりません: ${ICON_DIR}`);
    console.error('smartcity-dm-sprite の icons/dm-*.svg を配置してください。');
    process.exit(1);
  }

  const sym = symbolStyle(symbolCodes, names);
  const dir = directionStyle(directionCodes, names);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const files = [
    ['都市計画基本図_記号.qml', sym.style],
    ['都市計画基本図_方向.qml', dir.style],
    ['都市計画基本図_注記.qml', annotationStyle()],
  ];
  for (const [name, content] of files) {
    fs.writeFileSync(path.join(OUT_DIR, name), content, 'utf8');
    console.log(`qgis/${name}`);
  }

  const report = (label, codes, withIcon) => {
    if (codes.length === 0) return;
    const missing = codes.filter((c) => !loadIcon(c));
    console.log(`${label}: ${codes.length}種（地図記号 ${withIcon}種）`);
    if (missing.length) console.log(`  スプライトに記号が無いコード: ${missing.join(', ')}`);
    const unnamed = codes.filter((c) => !names[c]);
    if (unnamed.length) console.log(`  付録7に名称が無いコード: ${unnamed.join(', ')}`);
  };
  report('記号', symbolCodes, sym.withIcon);
  report('方向', directionCodes, dir.withIcon);
}

main();
