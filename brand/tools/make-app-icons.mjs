// App icons for the FiskOne apps from packages/ui-theme/brand (logo B):
//   node make-app-icons.mjs <path to the fiskalcloud repo>
// Writes: Android launcher icons (legacy, round, adaptive foreground), Android splash screens,
// a 1024 px PNG for `tauri icon` (Windows .ico/.png), and favicons for the till and back office.
import puppeteer from 'puppeteer-core';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const repo = process.argv[2];
if (!repo) throw new Error('Usage: node make-app-icons.mjs <repo>');
const brand = (f) => readFileSync(join(repo, 'packages/ui-theme/brand', f), 'utf8');
const icon = brand('fiskone-icon.svg');
const glyph = brand('fiskone-glyph.svg');
const logoDark = brand('fiskone-logo-dark.svg');
const NAVY = '#081C2D';
const inner = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
async function png(svgMarkup, w, h, file, transparent = false) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block}</style>${svgMarkup}`);
  mkdirSync(join(file, '..'), { recursive: true });
  await page.screenshot({ path: file, omitBackground: transparent, clip: { x: 0, y: 0, width: w, height: h } });
}

// 1024 px master for `tauri icon` (rounded tile on transparent).
await png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="1024" height="1024">${inner(icon)}</svg>`, 1024, 1024, join(repo, 'apps/pos/src-tauri/icons/source-1024.png'), true);

// Android launcher icons.
const res = join(repo, 'apps/pos/android/app/src/main/res');
const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [d, k] of Object.entries(densities)) {
  const s = Math.round(48 * k);
  await png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="${s}" height="${s}">${inner(icon)}</svg>`, s, s, join(res, `mipmap-${d}/ic_launcher.png`), true);
  await png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="${s}" height="${s}"><circle cx="48" cy="48" r="48" fill="${NAVY}"/><g transform="translate(48 48) scale(0.8) translate(-48 -48)">${inner(glyph)}</g></svg>`, s, s, join(res, `mipmap-${d}/ic_launcher_round.png`), true);
  // Adaptive foreground: 108 dp canvas, the glyph inside the 66 dp safe zone.
  const f = Math.round(108 * k);
  await png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="${f}" height="${f}"><g transform="translate(54 54) scale(0.72) translate(-48 -48)">${inner(glyph)}</g></svg>`, f, f, join(res, `mipmap-${d}/ic_launcher_foreground.png`), true);
}
writeFileSync(join(res, 'values/ic_launcher_background.xml'), `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${NAVY}</color>\n</resources>\n`);

// Android splash screens: navy, the logo with wordmark in the middle.
const [, lw, lh] = logoDark.match(/viewBox="0 0 (\d+) (\d+)"/).map(Number);
for (const dir of readdirSync(res).filter((d) => d.startsWith('drawable'))) {
  const file = join(res, dir, 'splash.png');
  let w, h;
  try {
    const b = readFileSync(file);
    w = b.readUInt32BE(16);
    h = b.readUInt32BE(20);
  } catch {
    continue;
  }
  const width = Math.round(Math.min(w, h) * 0.6);
  const height = Math.round((width * lh) / lw);
  await png(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${NAVY}"/><svg x="${(w - width) / 2}" y="${(h - height) / 2}" width="${width}" height="${height}" viewBox="0 0 ${lw} ${lh}">${inner(logoDark)}</svg></svg>`,
    w,
    h,
    file,
  );
}
await browser.close();
console.log('Android icons and splash screens written; source-1024.png ready for `tauri icon`.');
