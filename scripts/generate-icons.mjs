// Generates PNG icons at 16/32/48/128 px for one or all toolkit
// packages. Every icon shares a unified layout:
//
//   ┌──┬─────────┐
//   │▓▓│   li    │   ▓▓ = darker shade of the vendor color
//   │▓▓│         │   right = vendor brand color (canvas)
//   └──┴─────────┘   centered = 2-letter lowercase wordmark
//
// This avoids reproducing each vendor's trademarked glyph (LinkedIn
// "in", HF hugging-emoji, YT play-button, Snoo, etc.) while still
// surfacing the vendor's brand color for visual recognition. The
// sidebar is a darker tone in the same hue family as the canvas —
// contrast for separation, harmony for cohesion.
//
// Usage:
//   node scripts/generate-icons.mjs              # regenerate all packages
//   node scripts/generate-icons.mjs linkedin     # one package
//   node scripts/generate-icons.mjs linkedin github

import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crcBuf]);
};

const distToSegment = (px, py, x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
};

const shapeCoverage = (px, py, op, feather) => {
  let signed;
  if (op.kind === 'circle') {
    signed = op.r - Math.hypot(px - op.cx, py - op.cy);
  } else if (op.kind === 'line') {
    signed = op.t / 2 - distToSegment(px, py, op.x1, op.y1, op.x2, op.y2);
  } else if (op.kind === 'rect') {
    const cx = (op.x1 + op.x2) / 2;
    const cy = (op.y1 + op.y2) / 2;
    const hw = (op.x2 - op.x1) / 2;
    const hh = (op.y2 - op.y1) / 2;
    const dx = Math.abs(px - cx) - hw;
    const dy = Math.abs(py - cy) - hh;
    if (dx <= 0 && dy <= 0) {
      signed = -Math.max(dx, dy);
    } else {
      signed = -Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
    }
  } else {
    return 0;
  }
  if (signed >= feather) return 1;
  if (signed <= -feather) return 0;
  return 0.5 + signed / (2 * feather);
};

// ---------------------------------------------------------------------------
// Lowercase glyph library. Each glyph is a list of shape ops in local
// [0,1]^2 coordinates (0,0 = top-left of the glyph box). Designs are
// rectilinear block-letter forms — readable at small sizes and built
// purely from rect/line primitives the renderer already understands.
// ---------------------------------------------------------------------------

const GLYPHS = {
  l: [{ kind: 'rect', x1: 0.40, y1: 0.05, x2: 0.60, y2: 0.95 }],
  i: [
    { kind: 'rect', x1: 0.40, y1: 0.05, x2: 0.60, y2: 0.22 },
    { kind: 'rect', x1: 0.40, y1: 0.35, x2: 0.60, y2: 0.95 },
  ],
  g: [
    // closed bowl + right stem that drops into a descender curl
    { kind: 'rect', x1: 0.18, y1: 0.36, x2: 0.82, y2: 0.50 }, // top of bowl
    { kind: 'rect', x1: 0.18, y1: 0.36, x2: 0.32, y2: 0.78 }, // left side
    { kind: 'rect', x1: 0.18, y1: 0.66, x2: 0.82, y2: 0.78 }, // bottom of bowl
    { kind: 'rect', x1: 0.68, y1: 0.36, x2: 0.82, y2: 0.95 }, // right side + descender stem
    { kind: 'rect', x1: 0.18, y1: 0.83, x2: 0.82, y2: 0.95 }, // descender bottom curl
  ],
  h: [
    { kind: 'rect', x1: 0.18, y1: 0.05, x2: 0.32, y2: 0.95 }, // left ascender stem
    { kind: 'rect', x1: 0.18, y1: 0.40, x2: 0.82, y2: 0.52 }, // arch top
    { kind: 'rect', x1: 0.68, y1: 0.40, x2: 0.82, y2: 0.95 }, // right leg
  ],
  y: [
    { kind: 'line', x1: 0.18, y1: 0.36, x2: 0.50, y2: 0.66, t: 0.16 },
    { kind: 'line', x1: 0.82, y1: 0.36, x2: 0.50, y2: 0.66, t: 0.16 },
    { kind: 'rect', x1: 0.43, y1: 0.62, x2: 0.57, y2: 0.95 },
  ],
  t: [
    { kind: 'rect', x1: 0.10, y1: 0.25, x2: 0.90, y2: 0.37 }, // crossbar
    { kind: 'rect', x1: 0.42, y1: 0.08, x2: 0.58, y2: 0.95 }, // stem
  ],
  r: [
    { kind: 'rect', x1: 0.22, y1: 0.36, x2: 0.38, y2: 0.95 }, // stem
    { kind: 'rect', x1: 0.22, y1: 0.36, x2: 0.78, y2: 0.48 }, // top arm
    { kind: 'rect', x1: 0.66, y1: 0.36, x2: 0.78, y2: 0.56 }, // curl
  ],
  d: [
    { kind: 'rect', x1: 0.68, y1: 0.05, x2: 0.82, y2: 0.95 }, // right ascender stem
    { kind: 'rect', x1: 0.18, y1: 0.36, x2: 0.82, y2: 0.48 }, // bowl top
    { kind: 'rect', x1: 0.18, y1: 0.36, x2: 0.32, y2: 0.95 }, // bowl left
    { kind: 'rect', x1: 0.18, y1: 0.83, x2: 0.82, y2: 0.95 }, // bowl bottom
  ],
  f: [
    { kind: 'rect', x1: 0.42, y1: 0.05, x2: 0.85, y2: 0.18 }, // top hook
    { kind: 'rect', x1: 0.42, y1: 0.05, x2: 0.56, y2: 0.95 }, // stem
    { kind: 'rect', x1: 0.20, y1: 0.40, x2: 0.75, y2: 0.50 }, // crossbar
  ],
  n: [
    { kind: 'rect', x1: 0.18, y1: 0.36, x2: 0.32, y2: 0.95 }, // left stem
    { kind: 'rect', x1: 0.18, y1: 0.36, x2: 0.82, y2: 0.48 }, // arch top
    { kind: 'rect', x1: 0.68, y1: 0.36, x2: 0.82, y2: 0.95 }, // right leg
  ],
  x: [
    { kind: 'line', x1: 0.15, y1: 0.18, x2: 0.85, y2: 0.95, t: 0.18 },
    { kind: 'line', x1: 0.85, y1: 0.18, x2: 0.15, y2: 0.95, t: 0.18 },
  ],
};

// Transform glyph ops from local [0,1]^2 coords into image coords by
// placing the glyph inside a sub-box (ox, oy, w, h).
const placeGlyph = (char, ox, oy, w, h) => {
  const glyph = GLYPHS[char];
  if (!glyph) throw new Error(`No glyph for "${char}"`);
  const scale = Math.min(w, h);
  return glyph.map((op) => {
    if (op.kind === 'rect') {
      return {
        kind: 'rect',
        x1: ox + op.x1 * w,
        y1: oy + op.y1 * h,
        x2: ox + op.x2 * w,
        y2: oy + op.y2 * h,
      };
    }
    if (op.kind === 'line') {
      return {
        kind: 'line',
        x1: ox + op.x1 * w,
        y1: oy + op.y1 * h,
        x2: ox + op.x2 * w,
        y2: oy + op.y2 * h,
        t: op.t * scale,
      };
    }
    return op;
  });
};

// Compose the full set of letter ops for a package's 2-letter mark
// (or single letter for X), centered in the canvas region to the right
// of the sidebar.
const SIDEBAR_X = 0.22;

const composeLetterOps = (letters) => {
  const canvasLeft = SIDEBAR_X;
  const canvasWidth = 1 - canvasLeft;
  if (letters.length === 1) {
    // Single letter — make it big and centered.
    const w = 0.46;
    const h = 0.70;
    const ox = canvasLeft + (canvasWidth - w) / 2;
    const oy = (1 - h) / 2;
    return placeGlyph(letters[0], ox, oy, w, h);
  }
  // Two letters — side by side with a small gap, centered in the canvas.
  const letterW = 0.32;
  const letterH = 0.70;
  const gap = 0.02;
  const totalW = letterW * 2 + gap;
  const startX = canvasLeft + (canvasWidth - totalW) / 2;
  const oy = (1 - letterH) / 2;
  return [
    ...placeGlyph(letters[0], startX, oy, letterW, letterH),
    ...placeGlyph(letters[1], startX + letterW + gap, oy, letterW, letterH),
  ];
};

// ---------------------------------------------------------------------------
// Per-package palette. canvasBg is the vendor brand color (right of the
// sidebar); sidebarBg is a deeper tone in the same hue family — gives
// contrast for separation while feeling integrated with the canvas.
// letters lists the 2-letter (or 1-letter for X) mark and its color.
// ---------------------------------------------------------------------------

const WHITE = { r: 255, g: 255, b: 255 };
const SLATE = { r: 0x1f, g: 0x23, b: 0x28 };

const PACKAGES = {
  linkedin: {
    canvasBg: { r: 0x0a, g: 0x66, b: 0xc2 }, // LinkedIn blue
    sidebarBg: { r: 0x04, g: 0x37, b: 0x6b }, // deep navy
    letterColor: WHITE,
    letters: 'li',
  },
  github: {
    canvasBg: { r: 0x2d, g: 0x33, b: 0x3b }, // GitHub slate
    sidebarBg: { r: 0x14, g: 0x18, b: 0x1f }, // near-black slate
    letterColor: WHITE,
    letters: 'gh',
  },
  x: {
    // Canvas lifted slightly off pure black so a pure-black sidebar
    // reads as a distinct, deeper tone.
    canvasBg: { r: 0x18, g: 0x18, b: 0x18 },
    sidebarBg: { r: 0x00, g: 0x00, b: 0x00 },
    letterColor: WHITE,
    letters: 'x',
  },
  youtube: {
    canvasBg: { r: 0xff, g: 0x00, b: 0x00 }, // YouTube red
    sidebarBg: { r: 0x7a, g: 0x00, b: 0x00 }, // deep maroon
    letterColor: WHITE,
    letters: 'yt',
  },
  reddit: {
    canvasBg: { r: 0xff, g: 0x57, b: 0x00 }, // Reddit orange
    sidebarBg: { r: 0x8a, g: 0x2c, b: 0x00 }, // deep burnt orange
    letterColor: WHITE,
    letters: 'rd',
  },
  huggingface: {
    canvasBg: { r: 0xff, g: 0xd2, b: 0x1e }, // HF yellow
    sidebarBg: { r: 0x8a, g: 0x66, b: 0x00 }, // deep amber
    letterColor: SLATE, // dark letters on yellow for legibility
    letters: 'hf',
  },
  hackernews: {
    canvasBg: { r: 0xff, g: 0x66, b: 0x00 }, // YC orange
    sidebarBg: { r: 0x8a, g: 0x35, b: 0x00 }, // deep brown-orange
    letterColor: WHITE,
    letters: 'hn',
  },
};

const blendChannel = (a, b, alpha) => Math.round(a * (1 - alpha) + b * alpha);

const makePng = (size, palette) => {
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  const feather = 1 / size;
  const letterOps = composeLetterOps(palette.letters);

  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0;
    for (let x = 0; x < size; x++) {
      const nx = (x + 0.5) / size;
      const ny = (y + 0.5) / size;

      // Base background: sidebar on the left, canvas on the right,
      // with a feathered seam at SIDEBAR_X for clean anti-aliasing.
      const seam = (SIDEBAR_X - nx) / feather;
      const sidebarMix = Math.max(0, Math.min(1, 0.5 + seam / 2));
      const bgR = blendChannel(palette.canvasBg.r, palette.sidebarBg.r, sidebarMix);
      const bgG = blendChannel(palette.canvasBg.g, palette.sidebarBg.g, sidebarMix);
      const bgB = blendChannel(palette.canvasBg.b, palette.sidebarBg.b, sidebarMix);

      // Letter overlay only inside the canvas region.
      let coverage = 0;
      if (nx > SIDEBAR_X - feather) {
        for (const op of letterOps) {
          const c = shapeCoverage(nx, ny, op, feather);
          if (c > coverage) coverage = c;
          if (coverage >= 1) break;
        }
      }

      const off = y * stride + 1 + x * 4;
      raw[off] = blendChannel(bgR, palette.letterColor.r, coverage);
      raw[off + 1] = blendChannel(bgG, palette.letterColor.g, coverage);
      raw[off + 2] = blendChannel(bgB, palette.letterColor.b, coverage);
      raw[off + 3] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = deflateSync(raw);
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const args = process.argv.slice(2);
const targets = args.length > 0 ? args : Object.keys(PACKAGES);

for (const pkg of targets) {
  const palette = PACKAGES[pkg];
  if (!palette) {
    console.error(
      `[generate-icons] unknown package "${pkg}". ` +
        `Known: ${Object.keys(PACKAGES).join(', ')}`
    );
    process.exitCode = 1;
    continue;
  }
  const outDir = `packages/${pkg}/public/icons`;
  mkdirSync(outDir, { recursive: true });
  for (const size of [16, 32, 48, 128]) {
    writeFileSync(`${outDir}/icon-${size}.png`, makePng(size, palette));
    console.log(`wrote ${outDir}/icon-${size}.png`);
  }
}
