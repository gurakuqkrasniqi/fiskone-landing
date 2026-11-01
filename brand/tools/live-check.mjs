// Loads the live page and reports console errors and failed requests: node live-check.mjs <url>
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const p = await b.newPage();
const errors = [];
p.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 160)));
p.on('requestfailed', (r) => errors.push('failed: ' + r.url().slice(0, 120)));
for (const lang of ['sq', 'sr', 'en']) await p.goto(`${process.argv[2]}?lang=${lang}`, { waitUntil: 'networkidle0' });
console.log('errors:', errors.length ? errors : 'none');
await b.close();
