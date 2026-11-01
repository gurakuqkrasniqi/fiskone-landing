// Puts one of the logo concepts on the site: node scripts/use-logo.mjs a|b|c
// (a = Receipt One, b = F1 Monogram, c = Fiscal Seal). Copies the SVGs into public/.
import { copyFileSync } from 'node:fs';

const ids = { a: 'a-receipt', b: 'b-monogram', c: 'c-seal' };
const pick = ids[process.argv[2]];
if (!pick) {
  console.error('Usage: node scripts/use-logo.mjs a|b|c');
  process.exit(1);
}
const from = (kind) => new URL(`../brand/logos/fiskone-${pick}-${kind}.svg`, import.meta.url);
const to = (name) => new URL(`../public/${name}`, import.meta.url);
copyFileSync(from('light'), to('logo.svg'));
copyFileSync(from('dark'), to('logo-dark.svg'));
copyFileSync(from('icon'), to('icon.svg'));
copyFileSync(from('mark-dark'), to('icon-dark.svg'));
console.log(`Logo ${process.argv[2]} (${pick}) is now on the site. Rebuild: npm run build`);
