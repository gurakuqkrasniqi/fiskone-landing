// Firestore rules check against the local emulator:
//   npx firebase-tools emulators:exec --only firestore --project demo-fiskone "node tests/rules.test.mjs"
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, addDoc, collection, getDocs, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore/lite';

const db = getFirestore(initializeApp({ projectId: 'demo-fiskone', apiKey: 'demo', appId: 'demo' }));
connectFirestoreEmulator(db, '127.0.0.1', 8080);
const base = () => ({ name: 'Arta Krasniqi', business: 'Market Ylli', phone: '+383 44 123 456', email: 'arta@example.com', businessType: 'market', tills: '2-3', city: 'Prishtinë', message: 'Na duhet arkë për 2 dyqane', lang: 'sq', page: '/', consent: true, createdAt: serverTimestamp() });

let failed = 0;
async function expect(name, shouldPass, fn) {
  let ok;
  try { await fn(); ok = true; } catch { ok = false; }
  const good = ok === shouldPass;
  if (!good) failed++;
  console.log(`${good ? 'PASS' : 'FAIL'} ${name} (${ok ? 'allowed' : 'denied'})`);
}

const reqs = collection(db, 'contactRequests');
await expect('a valid request is saved', true, () => addDoc(reqs, base()));
await expect('only the required fields', true, () => addDoc(reqs, { name: 'Besa', business: 'Kafe Ura', phone: '044123456', consent: true, createdAt: serverTimestamp() }));
await expect('an extra field is refused', false, () => addDoc(reqs, { ...base(), admin: true }));
await expect('without consent is refused', false, () => addDoc(reqs, { ...base(), consent: false }));
await expect('a missing phone is refused', false, () => { const d = base(); delete d.phone; return addDoc(reqs, d); });
await expect('a 2001-character message is refused', false, () => addDoc(reqs, { ...base(), message: 'x'.repeat(2001) }));
await expect('an unknown business type is refused', false, () => addDoc(reqs, { ...base(), businessType: 'casino' }));
await expect('a made-up time is refused', false, () => addDoc(reqs, { ...base(), createdAt: new Date('2020-01-01') }));
await expect('a number instead of text is refused', false, () => addDoc(reqs, { ...base(), name: 12345 }));
await expect('reading the requests is refused', false, () => getDocs(reqs));
await expect('reading one request is refused', false, async () => { const r = await addDoc(reqs, base()); await getDoc(doc(db, 'contactRequests', r.id)); });
await expect('overwriting a request is refused', false, async () => { const r = await addDoc(reqs, base()); await setDoc(doc(db, 'contactRequests', r.id), base()); });
await expect('any other collection is closed', false, () => addDoc(collection(db, 'users'), { a: 1 }));
console.log(failed ? `${failed} FAILED` : 'ALL PASS');
process.exit(failed ? 1 : 0);
