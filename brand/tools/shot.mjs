// Screenshot of a local HTML page: node shot.mjs <file.html> <out.png> [width] [height]
import puppeteer from 'puppeteer-core';
import { pathToFileURL } from 'node:url';

const [file, png, w = '1500', h = '900'] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: 1 });
await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle0' });
await page.screenshot({ path: png, fullPage: true });
await browser.close();
