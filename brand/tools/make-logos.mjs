// Generates the three FiskOne logo concepts as SVG (text outlined from Manrope ExtraBold,
// so the files need no font) and a preview page. Run: node make-logos.mjs
import opentype from 'opentype.js';
import { mkdirSync, writeFileSync } from 'node:fs';

const C = {
  navy: '#081C2D',
  teal: '#0F766E',
  tealLight: '#2EB8A6',
  white: '#FFFFFF',
  soft: '#F5F7FA',
  gray: '#9AA3A8',
};

const font = opentype.loadSync(new URL('./manrope-800.ttf', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const out = new URL('../', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
mkdirSync(out + 'logos', { recursive: true });

/** "Fisk" + "One" as two outlined paths; returns svg and its box at the given size. */
function wordmark(size, fisk, one, x = 0, baseline = 0) {
  const spacing = -0.02 * size;
  let cursor = x;
  const parts = [];
  for (const [text, fill] of [['Fisk', fisk], ['One', one]]) {
    for (const ch of text) {
      const glyph = font.charToGlyph(ch);
      const p = glyph.getPath(cursor, baseline, size);
      parts.push(`<path fill="${fill}" d="${p.toPathData(2)}"/>`);
      cursor += (glyph.advanceWidth / font.unitsPerEm) * size + spacing;
    }
  }
  const ascent = (font.tables.os2.sCapHeight / font.unitsPerEm) * size;
  return { svg: parts.join(''), width: cursor - x - spacing, capHeight: ascent };
}

/** The numeral "1" from Manrope, centred in a box. */
function numeral(size, cx, cy, fill) {
  const glyph = font.charToGlyph('1');
  const p = glyph.getPath(0, 0, size);
  const b = p.getBoundingBox();
  const dx = cx - (b.x1 + b.x2) / 2;
  const dy = cy - (b.y1 + b.y2) / 2;
  const q = glyph.getPath(dx, dy, size);
  return `<path fill="${fill}" d="${q.toPathData(2)}"/>`;
}

// ── Marks, drawn on a 96 × 96 grid ──

/** A: a receipt (zigzag bottom) on a teal tile, the "1" printed on it. */
function markA(tile = C.teal, paper = C.white, ink = C.navy) {
  const zig = [];
  const x0 = 23, x1 = 73, top = 15, bottom = 80, teeth = 5, w = (x1 - x0) / teeth;
  for (let i = 0; i < teeth; i++) zig.push(`L${(x1 - i * w - w / 2).toFixed(2)} ${bottom - 6} L${(x1 - (i + 1) * w).toFixed(2)} ${bottom}`);
  return `<rect width="96" height="96" rx="22" fill="${tile}"/>
<path fill="${paper}" d="M${x0 + 4} ${top} H${x1 - 4} Q${x1} ${top} ${x1} ${top + 4} V${bottom} ${zig.join(' ')} V${top + 4} Q${x0} ${top} ${x0 + 4} ${top} Z"/>
${numeral(40, 48, 41, ink)}
<rect x="33" y="62" width="30" height="5" rx="2.5" fill="${C.tealLight}"/>`;
}

/** B: a geometric F whose stem is a "1" (flag at the top), the receipt line in teal. */
function markB(tile = C.navy, ink = C.white, accent = C.tealLight) {
  return `<rect width="96" height="96" rx="22" fill="${tile}"/>
<path fill="${ink}" d="M24 34 L42 18 H72 V31 H45 V42 H63 V54 H45 V78 H32 V40 L24 40 Z"/>
<rect x="66" y="43" width="12" height="12" rx="3" fill="${accent}"/>`;
}

/** C: an official seal: a perforated ring (stamp) around a bold "1", with a QR corner. */
function markC(ring = C.teal, ink = C.navy, bg = 'none') {
  const dots = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    dots.push(`<circle cx="${(48 + Math.cos(a) * 43).toFixed(2)}" cy="${(48 + Math.sin(a) * 43).toFixed(2)}" r="2.6" fill="${ring}"/>`);
  }
  return `${bg === 'none' ? '' : `<rect width="96" height="96" rx="22" fill="${bg}"/>`}
${dots.join('')}
<circle cx="48" cy="48" r="34" fill="none" stroke="${ring}" stroke-width="7"/>
${numeral(46, 48, 48, ink)}`;
}

const concepts = [
  {
    id: 'a-receipt',
    name: 'A · Receipt One',
    idea: 'The fiscal receipt with the “1” printed on it: says what FiskOne does at a glance.',
    mark: (dark) => markA(C.teal, C.white, C.navy),
    icon: () => markA(C.teal, C.white, C.navy),
  },
  {
    id: 'b-monogram',
    name: 'B · F1 Monogram',
    idea: 'An F whose stem is a “1”, with a teal receipt line: modern, strong at small sizes.',
    mark: (dark) => markB(dark ? C.teal : C.navy, C.white, dark ? C.navy : C.tealLight),
    icon: () => markB(C.navy, C.white, C.tealLight),
  },
  {
    id: 'c-seal',
    name: 'C · Fiscal Seal',
    idea: 'An official stamp around the “1”: trust, legality, the fiscal seal on every sale.',
    mark: (dark) => markC(dark ? C.tealLight : C.teal, dark ? C.white : C.navy),
    icon: () => markC(C.tealLight, C.white, C.navy),
  },
];

const svg = (w, h, body, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ''}${body}</svg>`;

function lockup(c, dark) {
  const size = 64;
  const wm = wordmark(size, dark ? C.white : C.navy, dark ? C.tealLight : C.teal, 120, 0);
  const height = 96;
  const baseline = height / 2 + wm.capHeight / 2;
  const body = `<g>${c.mark(dark)}</g><g transform="translate(0 ${baseline.toFixed(2)})">${wm.svg}</g>`;
  return { w: Math.ceil(120 + wm.width + 4), h: height, body };
}

const files = [];
for (const c of concepts) {
  for (const dark of [false, true]) {
    const l = lockup(c, dark);
    const name = `logos/fiskone-${c.id}-${dark ? 'dark' : 'light'}.svg`;
    writeFileSync(out + name, svg(l.w, l.h, l.body));
    files.push(name);
  }
  writeFileSync(out + `logos/fiskone-${c.id}-icon.svg`, svg(96, 96, c.icon()));
  writeFileSync(out + `logos/fiskone-${c.id}-mark.svg`, svg(96, 96, c.mark(false)));
}

// Preview page: each concept on light and dark, as an app icon, a favicon and a receipt header.
const card = (c) => `
<section class="c">
  <h2>${c.name}</h2><p>${c.idea}</p>
  <div class="row light"><img src="logos/fiskone-${c.id}-light.svg" height="72"></div>
  <div class="row dark"><img src="logos/fiskone-${c.id}-dark.svg" height="72"></div>
  <div class="row icons">
    <img src="logos/fiskone-${c.id}-icon.svg" width="160" class="app">
    <img src="logos/fiskone-${c.id}-icon.svg" width="56" class="app">
    <img src="logos/fiskone-${c.id}-icon.svg" width="32">
    <img src="logos/fiskone-${c.id}-icon.svg" width="16">
    <span class="tab"><img src="logos/fiskone-${c.id}-icon.svg" width="16"> FiskOne — Arka fiskale</span>
  </div>
</section>`;
writeFileSync(out + 'logo-options.html', `<!doctype html><meta charset="utf-8"><title>FiskOne logo options</title>
<style>
body{margin:0;padding:32px;font:15px/1.5 system-ui,sans-serif;background:#eef2f5;color:#081C2D}
h1{margin:0 0 4px} .sub{margin:0 0 24px;color:#56677a}
.grid{display:grid;gap:24px;grid-template-columns:repeat(3,1fr)}
.c{background:#fff;border-radius:16px;padding:20px;box-shadow:0 1px 3px rgb(0 0 0/.08)}
.c h2{margin:0;font-size:18px} .c p{margin:4px 0 16px;color:#56677a;min-height:44px}
.row{border-radius:12px;padding:22px;margin-bottom:12px;display:flex;align-items:center;gap:18px}
.light{background:#F5F7FA} .dark{background:#081C2D}
.icons{background:#f5f7fa;flex-wrap:wrap} .app{border-radius:22%;box-shadow:0 4px 14px rgb(8 28 45/.18)}
.tab{display:inline-flex;gap:6px;align-items:center;background:#fff;border:1px solid #dce4e8;border-radius:8px 8px 0 0;padding:6px 12px;font-size:12px}
</style>
<h1>FiskOne — 3 logo options</h1><p class="sub">Colours: navy #081C2D, teal #0F766E, light teal #2EB8A6. Wordmark: Manrope ExtraBold, outlined.</p>
<div class="grid">${concepts.map(card).join('')}</div>`);
console.log('wrote', files.length + 6, 'svg files and logo-options.html');
