// Screenshots of the built site (desktop and phone) and a form check: node check-site.mjs <url> <outdir>
import puppeteer from 'puppeteer-core';

const [url = 'http://localhost:4173/', out = '.'] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const [name, w, h] of [['desktop', 1440, 900], ['phone', 390, 844]]) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  await sleep(400);
  await page.screenshot({ path: `${out}/site-${name}-top.png` });
  await page.screenshot({ path: `${out}/site-${name}-full.png`, fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(`${name}: horizontal overflow ${overflow}px`);
}

// The form: empty send shows errors; a filled one reaches the "send" step.
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle0' });
await page.click('#contact-form button[type=submit]');
await sleep(300);
console.log('empty form errors:', await page.$$eval('.field__error', (e) => e.map((x) => x.textContent)));
await page.type('[name=name]', 'Arta Krasniqi');
await page.type('[name=business]', 'Market Ylli');
await page.type('[name=phone]', '+383 44 123 456');
await page.type('[name=email]', 'arta@example');
await page.click('[name=consent]');
await page.click('#contact-form button[type=submit]');
await sleep(300);
console.log('bad email:', await page.$$eval('.field__error', (e) => e.map((x) => x.textContent)));
await page.click('[name=email]', { clickCount: 3 });
await page.type('[name=email]', 'arta@example.com');
await page.click('#contact-form button[type=submit]');
await sleep(1500);
console.log('status:', await page.$eval('.form__status', (e) => e.textContent));
await page.evaluate(() => document.getElementById('contact').scrollIntoView());
await page.screenshot({ path: `${out}/site-form.png` });

// Languages.
for (const lang of ['sr', 'en', 'sq']) {
  await page.click(`[data-lang=${lang}]`);
  await sleep(150);
  console.log(lang, '→', await page.$eval('h1', (e) => e.textContent), '| lang attr', await page.evaluate(() => document.documentElement.lang));
}
console.log('page errors:', errors.filter((e) => !/Firebase is not configured/.test(e)));
await browser.close();
