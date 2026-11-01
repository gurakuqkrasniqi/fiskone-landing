// PNGs from the logo on the site (public/icon.svg, public/logo-dark.svg): the Apple touch
// icon, a 512 px icon and the social-share image (og.png, 1200 × 630).
// Run after scripts/use-logo.mjs: node brand/tools/make-pngs.mjs
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pub = (name) => fileURLToPath(new URL(`../../public/${name}`, import.meta.url));
const icon = readFileSync(pub('icon.svg'), 'utf8');
const logoDark = readFileSync(pub('logo-dark.svg'), 'utf8');

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();

async function render(html, width, height, file) {
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><style>html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden}</style>${html}`);
  await page.screenshot({ path: pub(file), omitBackground: false });
}

const sized = (svg, w, h) => svg.replace(/width="\d+" height="\d+"/, `width="${w}" height="${h}"`);
await render(`<div style="width:180px;height:180px">${sized(icon, 180, 180)}</div>`, 180, 180, 'icon-180.png');
await render(`<div style="width:512px;height:512px">${sized(icon, 512, 512)}</div>`, 512, 512, 'icon-512.png');

const [, w, h] = logoDark.match(/viewBox="0 0 (\d+) (\d+)"/).map(Number);
const lw = 640;
await render(
  `<div style="width:1200px;height:630px;background:radial-gradient(700px 360px at 85% 0%,#0F766E55,transparent 70%),#081C2D;display:flex;flex-direction:column;justify-content:center;padding:0 96px;box-sizing:border-box;font-family:Segoe UI,system-ui,sans-serif">
    ${sized(logoDark, lw, Math.round((lw * h) / w))}
    <p style="margin:40px 0 0;color:#fff;font-size:44px;font-weight:700;line-height:1.2">Arka fiskale e thjeshtë,<br>në kompjuter dhe telefon</p>
    <p style="margin:20px 0 0;color:#2EB8A6;font-size:28px;font-weight:600">fiskone.com</p>
  </div>`,
  1200,
  630,
  'og.png',
);
await browser.close();
console.log('wrote public/icon-180.png, icon-512.png, og.png');
