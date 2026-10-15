import { PNG } from "pngjs";
import fs from "node:fs";

const src = PNG.sync.read(
  fs.readFileSync("public/logo/logo-letterhead.png"),
);
// The "S" monogram occupies the left edge of the lockup
const w = Math.min(358, src.width);
const out = new PNG({ width: w, height: src.height });
for (let y = 0; y < src.height; y++) {
  for (let x = 0; x < w; x++) {
    const si = (y * src.width + x) * 4;
    const di = (y * w + x) * 4;
    out.data[di] = src.data[si];
    out.data[di + 1] = src.data[si + 1];
    out.data[di + 2] = src.data[si + 2];
    out.data[di + 3] = 255;
  }
}
fs.writeFileSync("public/logo/mark.png", PNG.sync.write(out));
console.log("mark.png", w, "x", src.height);
