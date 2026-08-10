// -----------------------------------------
// DM DATファイル読み込みクラス
// DM.py の Node.js 移植版
// -----------------------------------------
const fs = require('fs');
const iconv = require('iconv-lite');

const DATATYPE_MAP = {
  'E1': '面', 'E2': '線', 'E3': '円', 'E4': '円弧',
  'E5': '点', 'E6': '方向', 'E7': '注記', 'E8': '属性'
};

class DM {
  constructor(inDMFile) {
    this._DMFile = inDMFile;
    this._elementDict = null;
  }

  _decode(buf, start, end) {
    return iconv.decode(buf.slice(start, end), 'cp932');
  }

  _parse() {
    if (this._elementDict !== null) return;
    this._elementDict = {};

    const buf = fs.readFileSync(this._DMFile);

    // バイナリモードで行分割（Python の readlines() 相当）
    const lines = [];
    let start = 0;
    for (let i = 0; i < buf.length; i++) {
      if (buf[i] === 0x0a) { // \n
        lines.push(buf.slice(start, i + 1));
        start = i + 1;
      }
    }
    if (start < buf.length) {
      lines.push(buf.slice(start));
    }

    const decode = (b, s, e) => this._decode(b, s, e);
    let dictSeqno = 0;
    let recno = 0;
    let unitcode = '';
    let ldx = 0, ldy = 0;

    while (recno < lines.length) {
      const record = lines[recno];
      const rectype = decode(record, 0, 2);

      if (rectype[0] === 'M') {
        // 図郭レコード(a)
        unitcode = decode(record, 2, 10).trimEnd();
        const editcnt = parseInt(decode(record, 65, 67));
        recno++;
        // 図郭レコード(b)
        const recB = lines[recno];
        if (!recB) break;   // 途中で終端しているファイル
        ldx = parseFloat(decode(recB, 0, 7));
        ldy = parseFloat(decode(recB, 7, 14));
        // 図郭レコード(d)までシーク
        recno += 2;
        let cnt = 0;
        while (cnt < editcnt + 1) {
          const recD = lines[recno];
          if (!recD) break;
          const reccnt = parseInt(decode(recD, 9, 10));
          recno += reccnt + 2;
          cnt++;
        }

      } else if (rectype[0] === 'E') {
        const layercode = decode(record, 2, 6);
        const elementno = parseInt(decode(record, 12, 16));
        const recordcnt = parseInt(decode(record, 31, 35));
        const datakind = decode(record, 20, 21);
        const datacnt = parseInt(decode(record, 27, 31));
        let curRectype = rectype;
        let datatype = DATATYPE_MAP[rectype] || '';
        const elno = `${unitcode}-${layercode}-${String(elementno).padStart(4, '0')}`;

        if (curRectype === 'E1' || curRectype === 'E2') {
          // 線（E2）と面（E1）
          let pointcnt = 0;
          const xy = [];
          let rec = null;
          let truncated = false;
          while (pointcnt < datacnt) {
            if (pointcnt % 6 === 0) {
              recno++;
              rec = lines[recno];
              if (!rec) { truncated = true; break; }
            }
            const s = (pointcnt * 14) % 84;
            // 代表点座標（センチメートルからメートルに変換）
            const xVal = parseFloat(decode(rec, s, s + 7)) / 100;
            const yVal = parseFloat(decode(rec, s + 7, s + 14)) / 100;
            xy.push([ldy + yVal, ldx + xVal]);
            pointcnt++;
          }
          if (truncated) break;
          // 始終点が一致していれば面化する
          if (xy[0][0] === xy[xy.length - 1][0] && xy[0][1] === xy[xy.length - 1][1]) {
            curRectype = 'E1';
            datatype = DATATYPE_MAP['E1'];
          }
          this._elementDict[dictSeqno] = {
            FIGTYPE: curRectype,
            LAYER: layercode,
            ELNO: elno,
            XYList: xy,
            RECORD_TYPE: curRectype,
            DATA_KIND: datakind,
            DATA_TYPE: datatype
          };
          dictSeqno++;
          recno++;

        } else if (curRectype === 'E5') {
          // 点（E5）
          // 代表点座標（センチメートルからメートルに変換）
          const px = parseFloat(decode(record, 35, 42)) / 100;
          const py = parseFloat(decode(record, 42, 49)) / 100;
          this._elementDict[dictSeqno] = {
            FIGTYPE: curRectype,
            LAYER: layercode,
            ELNO: elno,
            XYList: [ldy + py, ldx + px],
            RECORD_TYPE: curRectype,
            DATA_KIND: datakind,
            DATA_TYPE: datatype
          };
          dictSeqno++;
          recno += recordcnt + 1;

        } else if (curRectype === 'E7') {
          // 注記（E7）
          // 代表点座標（センチメートルからメートルに変換）
          const px = parseFloat(decode(record, 35, 42)) / 100;
          const py = parseFloat(decode(record, 42, 49)) / 100;
          const rec2 = lines[recno + 1];
          if (!rec2) break;
          const vnflag = decode(rec2, 0, 1);
          const angle = parseInt(decode(rec2, 1, 8));
          const text = decode(rec2, 20, 84).trimEnd();
          this._elementDict[dictSeqno] = {
            FIGTYPE: curRectype,
            LAYER: layercode,
            ELNO: elno,
            XYList: [ldy + py, ldx + px],
            ANGLE: angle,
            VNFLAG: vnflag,
            TEXT: text,
            RECORD_TYPE: curRectype,
            DATA_KIND: datakind,
            DATA_TYPE: datatype
          };
          dictSeqno++;
          recno += recordcnt + 1;

        } else {
          recno += recordcnt + 1;
        }

      } else if (rectype[0] === 'H') {
        // グループヘッダレコード
        recno++;
      } else if (rectype[0] === 'G' || rectype[0] === 'T') {
        // グリッドヘッダ、TINレコード
        const recordcnt = parseInt(decode(record, 31, 35));
        recno += recordcnt + 1;
      } else {
        recno++;
      }
    }
  }

  [Symbol.iterator]() {
    this._parse();
    const dict = this._elementDict;
    const len = Object.keys(dict).length;
    let i = 0;
    return {
      next() {
        if (i >= len) return { done: true };
        return { value: dict[i++], done: false };
      }
    };
  }
}

module.exports = DM;
