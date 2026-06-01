/**
 * Generates placeholder PNG assets required by app.json.
 * Solid olive (#8A9B5C) background, white "N" lettermark.
 * Run once: node scripts/generate-assets.js
 */
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

/** Build a minimal RGBA PNG from a pixel-fill function */
function makePng(width, height, fillFn) {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width,  0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8]  = 8;   // bit depth
  ihdr[9]  = 2;   // color type: RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const ihdrChunk = chunk('IHDR', ihdr);

  // Raw image data: filter byte (0) + RGB rows
  const rows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 3);
    row[0] = 0; // filter = None
    for (let x = 0; x < width; x++) {
      const [r, g, b] = fillFn(x, y, width, height);
      row[1 + x * 3]     = r;
      row[1 + x * 3 + 1] = g;
      row[1 + x * 3 + 2] = b;
    }
    rows.push(row);
  }
  const raw       = Buffer.concat(rows);
  const compressed = zlib.deflateSync(raw);
  const idatChunk  = chunk('IDAT', compressed);
  const iendChunk  = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeB = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.concat([typeB, data]);
  const crc = crc32(crcBuf);
  const crcB = Buffer.alloc(4);
  crcB.writeUInt32BE(crc >>> 0, 0);
  return Buffer.concat([len, typeB, data, crcB]);
}

// CRC-32 table
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (const byte of buf) crc = crcTable[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF);
}

// Color palette
const OLIVE  = [138, 155, 92];   // #8A9B5C
const DARK   = [13,  13,  13];   // #0D0D0D
const WHITE  = [245, 245, 245];  // #F5F5F5

/** Solid olive fill (icon + adaptive-icon) */
function iconFill(x, y, w, h) {
  // Rounded feel: draw a white "N" lettermark in the center ~40% of image
  const cx = w / 2, cy = h / 2;
  const size = w * 0.38;
  const lx = cx - size / 2, rx = cx + size / 2;
  const thick = Math.max(1, Math.round(size * 0.18));

  const inLeft  = x >= lx && x < lx + thick && y >= cy - size / 2 && y < cy + size / 2;
  const inRight = x >= rx - thick && x < rx && y >= cy - size / 2 && y < cy + size / 2;
  const diag    = Math.abs((x - lx) / (rx - lx) - (y - (cy - size / 2)) / size) < thick / size;

  if (inLeft || inRight || diag) return WHITE;
  return OLIVE;
}

/** Splash: matte black with centered olive square logo */
function splashFill(x, y, w, h) {
  const sq = w * 0.25;
  const cx = w / 2, cy = h / 2;
  if (x >= cx - sq / 2 && x < cx + sq / 2 && y >= cy - sq / 2 && y < cy + sq / 2) return OLIVE;
  return DARK;
}

// Generate files
const files = [
  { name: 'icon.png',          w: 1024, h: 1024, fn: iconFill  },
  { name: 'adaptive-icon.png', w: 1024, h: 1024, fn: iconFill  },
  { name: 'splash-icon.png',   w: 1024, h: 1024, fn: splashFill },
  { name: 'favicon.png',       w: 64,   h: 64,   fn: iconFill  },
];

for (const { name, w, h, fn } of files) {
  const out = path.join(ASSETS_DIR, name);
  fs.writeFileSync(out, makePng(w, h, fn));
  console.log(`✔  Created ${name}  (${w}×${h})`);
}
console.log('\nDone. Assets saved to ./assets/');
