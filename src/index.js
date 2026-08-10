// -----------------------------------------
// DM → GeoJSON 変換メインスクリプト
// 使用方法:
//   node src/index.js                                    # input/2500/ を読み込み output/ へ出力
//   node src/index.js --scale 10000                      # input/10000/ を読み込み output/ へ出力
//   node src/index.js --epsg 6676                        # 入力座標系を指定（デフォルト: 6676）
//   node src/index.js --scale 2500 --input /path/to/dir  # 入力フォルダを直接指定
// -----------------------------------------
const path = require('path');
const fs = require('fs');
const DMFiles = require('./dmfiles');
const DM = require('./dm');
const GeoJSONWriter = require('./geojsonWriter');

// input/ と output/ はリポジトリルート直下（src/ の1つ上）
const ROOT = path.join(__dirname, '..');

function parseArgs() {
  const args = process.argv.slice(2);
  let scale = 2500;
  let input = null;
  let epsg  = 6676;   // デフォルト: JGD2011 / 日本平面直角座標系 第VIII系

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--scale' && args[i + 1]) {
      scale = parseInt(args[i + 1]);
    }
    if (args[i] === '--input' && args[i + 1]) {
      input = args[i + 1];
    }
    if (args[i] === '--epsg' && args[i + 1]) {
      epsg = parseInt(args[i + 1]);
    }
  }

  if (isNaN(scale) || scale <= 0) {
    console.error('--scale に正の整数を指定してください');
    process.exit(1);
  }
  if (isNaN(epsg) || epsg <= 0) {
    console.error('--epsg に正の整数を指定してください');
    process.exit(1);
  }

  // --input 省略時は input/${scale}/ フォルダを使用
  if (!input) {
    input = path.join(ROOT, 'input', String(scale));
  } else {
    input = path.resolve(input);
  }
  if (!fs.existsSync(input)) {
    console.error(`入力フォルダが見つかりません: ${input}`);
    process.exit(1);
  }

  return { scale, dmDir: input, epsg };
}

function main() {
  const { scale, dmDir, epsg } = parseArgs();

  const outDir = path.join(ROOT, 'output');
  fs.mkdirSync(outDir, { recursive: true });

  const outLine = path.join(outDir, `都市計画基本図_${scale}_線.geojson`);
  const outPoly = path.join(outDir, `都市計画基本図_${scale}_面.geojson`);
  const outSym  = path.join(outDir, `都市計画基本図_${scale}_記号.geojson`);
  const outTxt  = path.join(outDir, `都市計画基本図_${scale}_注記.geojson`);

  const wLine = new GeoJSONWriter(outLine, epsg);
  const wPoly = new GeoJSONWriter(outPoly, epsg);
  const wSym  = new GeoJSONWriter(outSym,  epsg);
  const wTxt  = new GeoJSONWriter(outTxt,  epsg);

  try {
    const dmfiles = new DMFiles(dmDir);
    for (const dmfile of dmfiles) {
      console.log(`File:[${dmfile}]`);
      const dats = new DM(dmfile);

      for (const dat of dats) {
        const fig = dat.FIGTYPE || '';

        if (fig === 'E2') {
          wLine.setGeometry(1, dat.XYList);
          wLine.setPropertie('Code',       dat.LAYER       || '');
          wLine.setPropertie('Elno',       dat.ELNO        || '');
          wLine.setPropertie('RecordType', dat.RECORD_TYPE || '');
          wLine.setPropertie('DataType',   dat.DATA_TYPE   || '');
          wLine.setPropertie('DataKind',   dat.DATA_KIND   || '');
          wLine.write();

        } else if (fig === 'E1') {
          wPoly.setGeometry(2, dat.XYList);
          wPoly.setPropertie('Code',       dat.LAYER       || '');
          wPoly.setPropertie('Elno',       dat.ELNO        || '');
          wPoly.setPropertie('RecordType', dat.RECORD_TYPE || '');
          wPoly.setPropertie('DataType',   dat.DATA_TYPE   || '');
          wPoly.setPropertie('DataKind',   dat.DATA_KIND   || '');
          wPoly.write();

        } else if (fig === 'E5') {
          wSym.setGeometry(5, dat.XYList);
          wSym.setPropertie('Code',       dat.LAYER       || '');
          wSym.setPropertie('Elno',       dat.ELNO        || '');
          wSym.setPropertie('RecordType', dat.RECORD_TYPE || '');
          wSym.setPropertie('DataType',   dat.DATA_TYPE   || '');
          wSym.setPropertie('DataKind',   dat.DATA_KIND   || '');
          wSym.write();

        } else if (fig === 'E7') {
          wTxt.setGeometry(4, dat.XYList);
          wTxt.setPropertie('Code',       dat.LAYER       || '');
          wTxt.setPropertie('Elno',       dat.ELNO        || '');
          wTxt.setPropertie('Text',       dat.TEXT        || '');
          wTxt.setPropertie('Vnflag',     dat.VNFLAG      || '');
          wTxt.setPropertie('Angle',      dat.ANGLE !== undefined ? dat.ANGLE : '');
          wTxt.setPropertie('RecordType', dat.RECORD_TYPE || '');
          wTxt.setPropertie('DataType',   dat.DATA_TYPE   || '');
          wTxt.setPropertie('DataKind',   dat.DATA_KIND   || '');
          wTxt.write();
        }
      }
    }
  } finally {
    wLine.close();
    wPoly.close();
    wSym.close();
    wTxt.close();
  }

  console.log('Done.');
  console.log(outLine);
  console.log(outPoly);
  console.log(outSym);
  console.log(outTxt);
  console.log(`DM dir: ${dmDir}`);
  console.log(`EPSG: ${epsg}`);
}

main();
