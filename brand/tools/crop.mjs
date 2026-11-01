import puppeteer from 'puppeteer-core';
const [url, sel, out, w = '1440'] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const p = await b.newPage(); await p.setViewport({ width: Number(w), height: 900 });
await p.goto(url, { waitUntil: 'networkidle0' });
const el = await p.$(sel); await el.screenshot({ path: out }); await b.close();
