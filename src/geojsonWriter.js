// -----------------------------------------
// GeoJSON出力用クラス
// GeoJSONWriter.py の Node.js 移植版
// -----------------------------------------
const fs = require('fs');
const proj4 = require('proj4');
const EPSG_DEFS = require('./epsgDefs');

proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');

// Python の str(round(x, 7)) 相当：7桁丸め、末尾ゼロなし
function fmt(n) {
  return parseFloat(n.toFixed(7)).toString();
}

class GeoJSONWriter {
  // epsgCode: 入力データの座標参照系（EPSG整数コード）
  constructor(outFile, epsgCode) {
    const def = EPSG_DEFS[epsgCode];
    if (!def) {
      const keys = Object.keys(EPSG_DEFS).join(', ');
      throw new Error(`未対応のEPSGコードです: ${epsgCode}\n対応コード: ${keys}`);
    }
    proj4.defs(`EPSG:${epsgCode}`, def);
    this._transform = proj4(`EPSG:${epsgCode}`, 'EPSG:4326').forward;

    this._fd = fs.openSync(outFile, 'w');
    this.geometry = null;
    this.properties = null;
    this._started = false;
    this._closed = false;
  }

  _write(str) {
    fs.writeSync(this._fd, str, null, 'utf8');
  }

  close() {
    if (this._closed) return;
    if (!this._started) {
      this._write('{"type":"FeatureCollection","features":[]}');
    } else {
      this._write('\n]}');
    }
    fs.closeSync(this._fd);
    this._closed = true;
  }

  // ジオメトリの設定
  setGeometry(figtype, xyList) {
    const tr = this._transform;
    if (figtype === 1) {
      // 折れ線
      let g = '\t{"type":"Feature",\n';
      g += '\t"geometry":{"type":"LineString","coordinates":[';
      g += xyList.map(xy => {
        const [lon, lat] = tr([xy[0], xy[1]]);
        return `[${fmt(lon)},${fmt(lat)}]`;
      }).join(',');
      g += ']';
      this.geometry = g;

    } else if (figtype === 2) {
      // ポリゴン（Python の numpy.flipud + append と同等）
      const XyList = [...xyList].reverse();
      XyList.push([...XyList[0]]);
      let g = '\t{"type":"Feature",\n';
      g += '\t"geometry":{"type":"Polygon","coordinates":[[';
      g += XyList.map(xy => {
        const [lon, lat] = tr([xy[0], xy[1]]);
        return `[${fmt(lon)},${fmt(lat)}]`;
      }).join(',');
      g += ']]';
      this.geometry = g;

    } else if (figtype === 4 || figtype === 5) {
      // 点（注記の代表点 or 記号）
      const [lon, lat] = tr([xyList[0], xyList[1]]);
      let g = '\t{"type":"Feature",\n';
      g += '\t"geometry":{"type":"Point","coordinates":';
      g += `[${fmt(lon)},${fmt(lat)}]`;
      this.geometry = g;
    }
  }

  // プロパティの設定
  setPropertie(name, value) {
    if (this.properties === null) {
      this.properties = '\t"properties":{';
    } else {
      this.properties += ',';
    }
    const val = Array.isArray(value) ? value.join('') : String(value);
    this.properties += `"${name}":"${val}"`;
  }

  // ファイルへの書き込み（1 Feature）
  write() {
    if (!this._started) {
      this._write('{"type":"FeatureCollection","features":[\n');
      this._started = true;
    } else {
      this._write(',\n');
    }
    this._write(this.geometry + '},\n');
    this._write(this.properties + '}}');

    this.geometry = null;
    this.properties = null;
  }
}

module.exports = GeoJSONWriter;
