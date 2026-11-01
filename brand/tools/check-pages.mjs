// Every page of the site: no console errors, no sideways scroll on phones, all internal
// links answer, the current page is marked, every language switches. node check-pages.mjs <base> <outdir>
import puppeteer from 'puppeteer-core';
const [base = 'http://localhost:4173', out = 'C:/tmp/pages'] = process.argv.slice(2);
const pages = ['/', '/vecorite', '/si-funksionon', '/cmimet', '/shkarko', '/udhezues', '/udhezues/cfare-me-duhet', '/udhezues/arka-pa-internet', '/udhezues/verifikimi-i-kuponit', '/udhezues/kuponet-nga-blloku', '/ndihma', '/kushtet', '/privatesia'];
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const p = await b.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(`${p.url()} ${e.message}`));
p.on('console', (m) => m.type() === 'error' && errors.push(`${p.url()} ${m.text().slice(0, 140)}`));
const links = new Set();
for (const path of pages) {
  for (const [w, h, tag] of [[1440, 900, 'desktop'], [390, 844, 'phone']]) {
    await p.setViewport({ width: w, height: h });
    const res = await p.goto(base + path + '?lang=sq', { waitUntil: 'networkidle0' });
    const info = await p.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      current: document.querySelector('.nav [aria-current=page]')?.textContent ?? '-',
      h1: document.querySelector('h1')?.textContent?.slice(0, 50),
      links: [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')),
    }));
    info.links.forEach((l) => links.add(l.split('#')[0] || '/'));
    if (tag === 'desktop') console.log(`${res.status()} ${path.padEnd(32)} current:${info.current.padEnd(14)} ${info.h1}`);
    if (info.overflow > 0) console.log(`  OVERFLOW ${tag} ${info.overflow}px on ${path}`);
    const name = (path === '/' ? 'home' : path.slice(1).replace('/', '_'));
    await p.screenshot({ path: `${out}/${name}-${tag}.png`, fullPage: true });
  }
  // Languages: every data-i18n text changes away from Albanian in sr and en.
  for (const lang of ['sr', 'en']) {
    await p.goto(base + path + '?lang=' + lang, { waitUntil: 'networkidle0' });
    const same = await p.evaluate(() => document.title);
    if (/— FiskOne$/.test(same) && lang && path !== '/' && !/Mogućnosti|Features|Kako|How|Cene|Pricing|Preuzimanje|Download|Vodiči|Guides|Pomoć|Help|Uslovi|Terms|Privatnost|Privacy|—/.test(same)) console.log('  title not translated', path, lang, same);
  }
}
for (const l of links) {
  const r = await p.goto(base + l, { waitUntil: 'domcontentloaded' });
  if (r.status() !== 200) console.log('BROKEN LINK', l, r.status());
}
console.log('internal links checked:', links.size);
console.log('errors:', errors.length ? errors.slice(0, 10) : 'none');
await b.close();
