// -----------------------------------------
// 日本平面直角座標系 EPSG定義
// JGD2011 (EPSG:6669-6687) / JGD2000 (EPSG:2443-2461)
// -----------------------------------------

const GRS80  = '+ellps=GRS80 +units=m +no_defs';
const BESSEL = '+ellps=bessel +towgs84=-146.414,507.337,680.507,0,0,0,0 +units=m +no_defs';

// 系番号ごとの緯度原点・中央経線
const ZONES = [
  // [系,  lat_0, lon_0]
  [ 1,  33,   129.5     ],
  [ 2,  33,   131       ],
  [ 3,  36,   132.16667 ],
  [ 4,  33,   133.5     ],
  [ 5,  36,   134.33333 ],
  [ 6,  36,   136       ],
  [ 7,  36,   137.16667 ],
  [ 8,  36,   138.5     ],
  [ 9,  36,   139.83333 ],
  [10,  40,   140.83333 ],
  [11,  44,   140.25    ],
  [12,  44,   142.25    ],
  [13,  44,   144.25    ],
  [14,  26,   142       ],
  [15,  26,   127.5     ],
  [16,  26,   124       ],
  [17,  26,   131       ],
  [18,  20,   136       ],
  [19,  26,   154       ],
];

function tmerc(lat0, lon0, ellps) {
  return `+proj=tmerc +lat_0=${lat0} +lon_0=${lon0} +k=0.9999 +x_0=0 +y_0=0 ${ellps}`;
}

const EPSG_DEFS = {};

ZONES.forEach(([zone, lat0, lon0], i) => {
  // JGD2011 (EPSG:6669〜6687)
  EPSG_DEFS[6669 + i] = tmerc(lat0, lon0, GRS80);
  // JGD2000 (EPSG:2443〜2461)
  EPSG_DEFS[2443 + i] = tmerc(lat0, lon0, GRS80);
  // 旧日本測地系 Tokyo (EPSG:30161〜30179)
  EPSG_DEFS[30161 + i] = tmerc(lat0, lon0, BESSEL);
});

module.exports = EPSG_DEFS;
