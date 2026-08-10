// -----------------------------------------
// DMファイルリスト管理クラス
// DMFiles.py の Node.js 移植版
// -----------------------------------------
const fs = require('fs');
const path = require('path');

class DMFiles {
  constructor(inPath) {
    this._MAPPath = inPath;

    if (fs.existsSync(this._MAPPath)) {
      const files = fs.readdirSync(this._MAPPath);
      this._MAPList = files
        .filter(f => f.toLowerCase().endsWith('.dm'))
        .map(f => path.join(this._MAPPath, f));
    } else {
      this._MAPList = null;
    }
  }

  [Symbol.iterator]() {
    const list = this._MAPList;
    let i = 0;
    return {
      next() {
        if (!list || i >= list.length) return { done: true };
        return { value: list[i++], done: false };
      }
    };
  }
}

module.exports = DMFiles;
