// -----------------------------------------
// 地図記号SVG（qgis/symbols/）を dm-sprite に追従させるスクリプト
//
// ビューワはスプライトを URL で参照する（viewer/src/basemap.ts の DM_SPRITE_URL）ため
// 上流の更新が自動で反映されるが、QGIS 用の .qml は SVG を base64 で埋め込む都合上、
// qgis/symbols/ にコピーを置いている。このコピーは放っておくと上流から遅れる。
//
// 使い方:
//   node scripts/sync-dm-symbols.js            # 上流の最新に合わせて取得・更新する
//   node scripts/sync-dm-symbols.js --check    # 差分の報告だけ（書き換えない。差分ありなら終了コード1）
//   node scripts/sync-dm-symbols.js --ref v1.2 # タグ・ブランチ・コミットを指定して固定する
//   node scripts/sync-dm-symbols.js --prune    # 上流から消えたSVGをローカルからも消す
//
// 取得元のコミットは qgis/symbols/SOURCE.json に記録する。どの時点のスプライトを
// 埋め込んだかを後から特定できるようにするため。
//
// SVGを更新したら .qml を作り直すこと（埋め込みなので、SVGだけ替えても反映されない）。
//   node scripts/make-qgis-styles.js
// -----------------------------------------
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const ICON_DIR = path.join(ROOT, 'qgis', 'symbols');
const SOURCE_FILE = path.join(ICON_DIR, 'SOURCE.json');

/** 上流のスプライト。fork 側を見ているのは、本家に無い記号を追加しているため。 */
const REPO = 'shiwaku/dm-sprite';
const ICON_PATH = 'icons';

/**
 * 取り込む対象。`dm-<コード>.svg` だけを見る。
 * 分類コードは4桁だが、上流には7桁のコード（dm-9101100.svg など）もあるため桁数は縛らない。
 * 一方 map-pin.svg のような分類コードに対応しないアイコンは、.qml がコードでしか
 * 引かないため対象外にする。
 */
const ICON_RE = /^dm-\d+\.svg$/;

/** 同時に投げるリクエスト数。上流に負荷をかけない程度に抑える。 */
const CONCURRENCY = 8;

const hasFlag = (name) => process.argv.includes(name);

function strArg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

/**
 * Git のブロブハッシュ。GitHub の contents API が返す sha と同じ計算式なので、
 * これを突き合わせれば中身が同じファイルをダウンロードせずに済む。
 */
function blobSha(buf) {
  return crypto
    .createHash('sha1')
    .update(Buffer.concat([Buffer.from(`blob ${buf.length}\0`), buf]))
    .digest('hex');
}

async function getJson(url) {
  const headers = { accept: 'application/vnd.github+json', 'user-agent': 'dm-converter' };
  // トークンがあれば使う。無くても動くが、API のレート制限が緩くなる。
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return res.json();
}

async function getRaw(commit, name) {
  const url = `https://raw.githubusercontent.com/${REPO}/${commit}/${ICON_PATH}/${name}`;
  const res = await fetch(url, { headers: { 'user-agent': 'dm-converter' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

/** items を CONCURRENCY 本で順に処理する。 */
async function mapLimit(items, fn) {
  const results = [];
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker));
  return results;
}

function localIcons() {
  if (!fs.existsSync(ICON_DIR)) return new Map();
  const map = new Map();
  for (const name of fs.readdirSync(ICON_DIR)) {
    if (!ICON_RE.test(name)) continue;
    map.set(name, blobSha(fs.readFileSync(path.join(ICON_DIR, name))));
  }
  return map;
}

const codeOf = (name) => name.slice(3, -4);
const list = (names) => names.map(codeOf).join(' ');

async function main() {
  const check = hasFlag('--check');
  const prune = hasFlag('--prune');
  const ref = strArg('--ref', 'main');

  const commit = await getJson(`https://api.github.com/repos/${REPO}/commits/${ref}`);
  const sha = commit.sha;
  const committedAt = commit.commit?.committer?.date ?? '';
  console.log(`上流: ${REPO}@${ref} → ${sha.slice(0, 7)}（${committedAt}）`);

  const entries = await getJson(
    `https://api.github.com/repos/${REPO}/contents/${ICON_PATH}?ref=${sha}`,
  );
  const upstream = new Map(
    entries.filter((e) => e.type === 'file' && ICON_RE.test(e.name)).map((e) => [e.name, e.sha]),
  );
  if (upstream.size === 0) throw new Error(`${REPO} の ${ICON_PATH}/ に地図記号SVGが見つかりません`);

  const local = localIcons();
  const added = [...upstream.keys()].filter((n) => !local.has(n)).sort();
  const changed = [...upstream.keys()].filter((n) => local.has(n) && local.get(n) !== upstream.get(n)).sort();
  const removed = [...local.keys()].filter((n) => !upstream.has(n)).sort();

  console.log(`上流 ${upstream.size}件 / ローカル ${local.size}件`);
  if (added.length) console.log(`  追加 ${added.length}件: ${list(added)}`);
  if (changed.length) console.log(`  更新 ${changed.length}件: ${list(changed)}`);
  if (removed.length) console.log(`  上流から消えた ${removed.length}件: ${list(removed)}`);

  const drift = added.length + changed.length + removed.length;
  if (drift === 0) {
    console.log('差分なし。qgis/symbols/ は上流に追従しています。');
    if (!check) writeSource(sha, committedAt, upstream.size);
    return;
  }

  if (check) {
    console.error('\n差分があります。`node scripts/sync-dm-symbols.js` で取り込んでください。');
    process.exitCode = 1;
    return;
  }

  const fetchList = [...added, ...changed];
  await mapLimit(fetchList, async (name) => {
    const buf = await getRaw(sha, name);
    // 取得したものが本当に上流のブロブかを確かめる。CDN のキャッシュ差しかえ対策。
    if (blobSha(buf) !== upstream.get(name)) {
      throw new Error(`${name} の内容が contents API の sha と一致しません`);
    }
    fs.writeFileSync(path.join(ICON_DIR, name), buf);
  });
  console.log(`${fetchList.length}件を書き込みました。`);

  // 上流から消えたものは、既存の .qml が参照している可能性があるため既定では消さない。
  if (removed.length) {
    if (prune) {
      for (const name of removed) fs.unlinkSync(path.join(ICON_DIR, name));
      console.log(`${removed.length}件を削除しました。`);
    } else {
      console.log('上流から消えたSVGは残しています（消すには --prune）。');
    }
  }

  writeSource(sha, committedAt, upstream.size);
  console.log('\n次に .qml を作り直してください（SVGは埋め込みのため、作り直さないと反映されません）:');
  console.log('  node scripts/make-qgis-styles.js');
}

function writeSource(sha, committedAt, count) {
  const body = {
    repo: `https://github.com/${REPO}`,
    license: 'MIT',
    commit: sha,
    committed_at: committedAt,
    icons: count,
    synced_at: new Date().toISOString(),
    note: 'scripts/sync-dm-symbols.js が生成。手で編集しないこと。',
  };
  fs.writeFileSync(SOURCE_FILE, `${JSON.stringify(body, null, 2)}\n`);
}

main().catch((err) => {
  console.error(`同期に失敗しました: ${err.message}`);
  process.exit(1);
});
