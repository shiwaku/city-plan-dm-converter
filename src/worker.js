// -----------------------------------------
// 並列変換のワーカー。割り当てられた .dm ファイル群を変換し、
// 種別ごとの断片ファイル（FeatureCollection の外枠なし）を書き出す。
// 断片はメインプロセスが元のファイル順に連結する。
// -----------------------------------------
const path = require('path');
const { parentPort, workerData } = require('worker_threads');
const GeoJSONWriter = require('./geojsonWriter');
const { KINDS, convertFiles } = require('./convert');

const { files, epsg, tmpDir, index } = workerData;

const writers = {};
for (const kind of KINDS) {
  writers[kind] = new GeoJSONWriter(path.join(tmpDir, `${kind}.${index}.part`), epsg, { fragment: true });
}

try {
  convertFiles(files, writers, (f) => parentPort.postMessage({ type: 'file', file: f }));
} finally {
  for (const kind of KINDS) writers[kind].close();
}

parentPort.postMessage({ type: 'done', index });
