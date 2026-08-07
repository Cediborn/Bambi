/**
 * Generates the BAMBI app icons (PNG) with zero dependencies.
 *
 * Renders the same night-sky mark as app/icon.svg — deep indigo gradient,
 * a violet glow, a seed moon, a four-point sparkle and faint stars — at
 * 512 (manifest), 192 (manifest) and 180 (apple-touch-icon) pixels.
 *
 * Run: node scripts/gen-icons.mjs
 */
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

/* --- minimal PNG encoder --- */

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 4 + body.length);
  return out;
}

function encodePNG(size, pixel) {
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(size * stride);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixel(x, y, size);
      const o = y * stride + 1 + x * 4;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* --- pixel art --- */

const hex = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (c1, c2, t) => [
  lerp(c1[0], c2[0], t),
  lerp(c1[1], c2[1], t),
  lerp(c1[2], c2[2], t),
];
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const dist = (dx, dy) => Math.sqrt(dx * dx + dy * dy);

const BG_TOP = hex("#0F172A");
const BG_BOTTOM = hex("#312E81");
const GLOW = hex("#8B5CF6");
const MOON = hex("#F8FAFC");
const SHADE = hex("#1E1B4B");

const DOTS = [
  [0.16, 0.24, 0.011, 0.55],
  [0.82, 0.6, 0.009, 0.5],
  [0.76, 0.84, 0.013, 0.6],
  [0.27, 0.46, 0.007, 0.45],
  [0.56, 0.13, 0.008, 0.5],
  [0.44, 0.78, 0.01, 0.5],
];

function draw(size, x, y) {
  const u = x / size;
  const v = y / size;

  // deep indigo diagonal gradient
  let c = mix(BG_TOP, BG_BOTTOM, (u + v) / 2);

  // violet bloom in the lower-left corner
  const glow = clamp01(1 - dist((u - 0.3) / 0.75, (v - 0.78) / 0.75)) ** 2 * 0.9;
  c = mix(c, GLOW, glow);

  // the seed moon, soft-edged
  const moon = clamp01(1 - dist((u - 0.5) / 0.21, (v - 0.56) / 0.21));
  c = mix(c, MOON, moon ** 1.5);

  // crescent shading so the moon isn't a flat disc
  const shade = clamp01(1 - dist((u - 0.545) / 0.21, (v - 0.485) / 0.21));
  c = mix(c, SHADE, shade ** 2 * 0.22);

  // four-point sparkle (concave diamond)
  const star = clamp01(1 - (Math.abs((u - 0.72) / 0.135) ** 0.45 + Math.abs((v - 0.27) / 0.135) ** 0.45));
  c = mix(c, MOON, star ** 1.2 * 0.95);

  // faint companion stars
  for (const [du, dv, dr, da] of DOTS) {
    const dot = clamp01(1 - dist((u - du) / dr, (v - dv) / dr));
    c = mix(c, MOON, dot * da);
  }

  return [Math.round(c[0]), Math.round(c[1]), Math.round(c[2])];
}

/* --- output --- */

for (const size of [512, 192, 180]) {
  const png = encodePNG(size, (x, y) => draw(size, x + 0.5, y + 0.5));
  const name =
    size === 180 ? "public/apple-touch-icon.png" : `public/icon-${size}.png`;
  writeFileSync(name, png);
  console.log(`wrote ${name} (${png.length} bytes)`);
}
