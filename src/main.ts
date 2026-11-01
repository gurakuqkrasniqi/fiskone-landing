import '@fontsource-variable/manrope';
import './styles.css';
import { LANGS, SQ_SCRIPT, TEXTS, type Lang } from './i18n';
import { firebaseConfig, firebaseReady } from './firebase-config';

// ── Language: Albanian is the HTML; Serbian and English replace the marked texts ──

const STORAGE_KEY = 'fiskone.lang';
const original = new Map<Element, string>();
const originalAttrs = new Map<Element, Record<string, string>>();
let lang: Lang = 'sq';

function text(key: string): string {
  if (lang === 'sq') return SQ_SCRIPT[key] ?? '';
  return TEXTS[lang][key] ?? SQ_SCRIPT[key] ?? '';
}

function setLang(next: Lang): void {
  lang = next;
  document.documentElement.lang = next === 'sr' ? 'sr-Latn' : next;
  for (const el of document.querySelectorAll<HTMLElement>('[data-i18n]')) {
    if (!original.has(el)) original.set(el, el.textContent ?? '');
    const key = el.dataset['i18n']!;
    el.textContent = next === 'sq' ? original.get(el)! : (TEXTS[next][key] ?? original.get(el)!);
  }
  for (const el of document.querySelectorAll<HTMLElement>('[data-i18n-attr]')) {
    const [attr, key] = el.dataset['i18nAttr']!.split(':') as [string, string];
    const saved = originalAttrs.get(el) ?? {};
    if (!(attr in saved)) saved[attr] = el.getAttribute(attr) ?? '';
    originalAttrs.set(el, saved);
    el.setAttribute(attr, next === 'sq' ? saved[attr]! : (TEXTS[next][key] ?? saved[attr]!));
  }
  if (next !== 'sq') document.title = TEXTS[next]['title'] ?? document.title;
  else document.title = 'FiskOne — Arka fiskale e thjeshtë për Kosovë';
  for (const b of document.querySelectorAll<HTMLButtonElement>('[data-lang]')) b.setAttribute('aria-pressed', String(b.dataset['lang'] === next));
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // private mode: the choice lasts for this visit
  }
}

function initialLang(): Lang {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  const pick = [fromUrl, saved].find((l): l is Lang => !!l && (LANGS as readonly string[]).includes(l));
  if (pick) return pick;
  const browser = navigator.language.toLowerCase();
  return browser.startsWith('sr') || browser.startsWith('hr') || browser.startsWith('bs') ? 'sr' : 'sq';
}

for (const b of document.querySelectorAll<HTMLButtonElement>('[data-lang]')) b.addEventListener('click', () => setLang(b.dataset['lang'] as Lang));
const start = initialLang();
if (start !== 'sq') setLang(start);

const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

// ── Contact form → Firestore (create-only; see firestore.rules) ──

const form = document.getElementById('contact-form') as HTMLFormElement;
const status = form.querySelector<HTMLParagraphElement>('.form__status')!;
const submit = form.querySelector<HTMLButtonElement>('button[type=submit]')!;

const value = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null)?.value.trim() ?? '';

function showStatus(kind: 'ok' | 'error' | 'info', message: string): void {
  status.hidden = false;
  status.textContent = message;
  status.className = `form__status form__status--${kind}`;
}

/** Marks a field invalid with its message under it; returns false when it is. */
function check(name: string, ok: boolean, message: string): boolean {
  const input = form.elements.namedItem(name) as HTMLInputElement;
  const field = input.closest('.field, .check')!;
  field.querySelector('.field__error')?.remove();
  input.setAttribute('aria-invalid', String(!ok));
  if (!ok) {
    const error = document.createElement('span');
    error.className = 'field__error';
    error.id = `err-${name}`;
    error.textContent = message;
    input.setAttribute('aria-describedby', error.id);
    field.append(error);
  } else input.removeAttribute('aria-describedby');
  return ok;
}

function validate(): boolean {
  const email = value('email');
  const phone = value('phone').replace(/[\s()./-]/g, '');
  const results = [
    check('name', value('name').length >= 2, text('form.required')),
    check('business', value('business').length >= 2, text('form.required')),
    check('phone', /^\+?\d{6,15}$/.test(phone), value('phone') ? text('form.badPhone') : text('form.required')),
    check('email', !email || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email), text('form.badEmail')),
    check('consent', (form.elements.namedItem('consent') as HTMLInputElement).checked, text('form.required')),
  ];
  return results.every(Boolean);
}

async function send(): Promise<void> {
  // Loaded only when someone sends: the page itself stays light.
  const [{ initializeApp }, { getFirestore, addDoc, collection, serverTimestamp }] = await Promise.all([
    import('firebase/app'),
    import('firebase/firestore/lite'),
  ]);
  const db = getFirestore(initializeApp(firebaseConfig));
  await addDoc(collection(db, 'contactRequests'), {
    name: value('name'),
    business: value('business'),
    phone: value('phone'),
    email: value('email'),
    businessType: value('businessType'),
    tills: value('tills'),
    city: value('city'),
    message: value('message'),
    lang,
    page: location.pathname,
    consent: true,
    createdAt: serverTimestamp(),
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  status.hidden = true;
  if (!validate()) {
    showStatus('error', text('form.invalid'));
    form.querySelector<HTMLElement>('[aria-invalid=true]')?.focus();
    return;
  }
  // A bot filled the hidden field: answer as if it worked, store nothing.
  if (value('website')) {
    form.reset();
    showStatus('ok', text('form.ok'));
    return;
  }
  submit.disabled = true;
  const label = submit.textContent;
  submit.textContent = text('form.sending');
  try {
    if (!firebaseReady()) throw new Error('Firebase is not configured (src/firebase-config.ts)');
    await send();
    form.reset();
    showStatus('ok', text('form.ok'));
  } catch (error) {
    console.error(error);
    showStatus('error', text('form.error'));
  } finally {
    submit.disabled = false;
    submit.textContent = label;
  }
});

// Fields lose their error as soon as they are corrected.
form.addEventListener('input', (event) => {
  const input = event.target as HTMLInputElement;
  if (input.getAttribute('aria-invalid') === 'true') {
    input.removeAttribute('aria-invalid');
    input.closest('.field, .check')?.querySelector('.field__error')?.remove();
  }
});
