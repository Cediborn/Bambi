/**
 * Generates the BAMBI app icons (PNG) from the official uploaded logo.
 *
 * Source asset: BAMBILOGO.jpg at the repo root. The deer + green leaf mark
 * is cropped out, the dark navy background is keyed to transparency, and the
 * transparent mark is centred on a solid dark-navy square to produce
 *   - public/icon-512.png (manifest)
 *   - public/icon-192.png (manifest)
 *   - public/apple-touch-icon.png (180)
 *
 * Requires Python 3 with Pillow (`pip install Pillow`).
 *
 * Run: node scripts/gen-icons.mjs
 */
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const SOURCE = "BAMBILOGO.jpg";
const NAVY = [10, 15, 51, 255];

/**
 * Renders a navy square of `size` with the cropped, background-keyed logo
 * centred and fitted inside, then writes it to `out`.
 */
function writeIcon(size, padFrac, out) {
  const py = `
from PIL import Image, ImageChops
import sys

img = Image.open(${JSON.stringify(SOURCE)}).convert("RGB")
px = img.load()

# content bounds of the deer + leaf emblem
x0, x1 = 253, 771
y0, y1 = 178, 852
padx, pady = 34, 34
left = max(0, x0 - padx); right = min(img.width, x1 + padx)
top = max(0, y0 - pady); bottom = min(img.height, y1 + pady)
crop = img.crop((left, top, right, bottom))
cw, ch = crop.size
emblem = Image.new("RGBA", (cw, ch), (0,0,0,0))
ec = emblem.load(); cp = crop.load()
lo, hi = 60, 120
for y in range(ch):
    for x in range(cw):
        r, g, b = cp[x, y]
        L = max(r, g, b)
        a = 0 if L <= lo else (255 if L >= hi else int((L-lo)/(hi-lo)*255))
        ec[x, y] = (r, g, b, a)

size = ${size}
pad = int(size * ${padFrac})
avail = size - 2*pad
scale = min(avail/cw, avail/ch)
nw, nh = int(cw*scale), int(ch*scale)
mark = emblem.resize((nw, nh), Image.LANCZOS)
canvas = Image.new("RGBA", (size, size), ${JSON.stringify(NAVY)})
canvas.paste(mark, ((size-nw)//2, (size-nh)//2), mark)
canvas.convert("RGB").save(${JSON.stringify(out)})
print("wrote", ${JSON.stringify(out)})
`;
  const res = execFileSync("python", ["-c", py], { encoding: "utf8" });
  process.stdout.write(res);
}

mkdirSync("public", { recursive: true });
writeIcon(512, 0.12, "public/icon-512.png");
writeIcon(192, 0.10, "public/icon-192.png");
writeIcon(180, 0.12, "public/apple-touch-icon.png");
