# fiskone.com — landing page

Single-page site for FiskOne (Albanian, Serbian, English) with a contact form. Static files on
**Firebase Hosting**; the form saves requests in **Cloud Firestore**. Both are on Firebase's free
Spark plan.

- Pages (one HTML file each, Albanian text in the HTML for search engines): `index.html` (home with the
  contact form), `vecorite`, `si-funksionon`, `cmimet`, `shkarko`, `ndihma`, `kushtet`, `privatesia`, and
  the guides `udhezues.html` + `udhezues/*.html`. Firebase serves them at clean URLs (`/cmimet`).
- `partials/header.html`, `partials/footer.html`: written once, put into every page at build time
  (`<!--#header-->`, `<!--#footer-->`, see `vite.config.ts`).
- Guides: edit the articles in `scripts/make-guides.py`, then `python scripts/make-guides.py`.
- Prices (100 € per business, 30 € per till, per year): `PRICE_BUSINESS` / `PRICE_TILL` in `src/main.ts`
  and the texts that state them.
- `src/i18n.ts`, `src/i18n-pages.ts`: Serbian and English texts (same keys as `data-i18n` in the HTML).
- `src/main.ts`: language switch, form checks, sending to Firestore (loaded only on send).
- `firestore.rules`: visitors can only **add** a valid request; nobody can read, change or delete
  one from the site. Checked by `tests/rules.test.mjs` (13 cases) against the emulator.
- `brand/`: the three logo concepts (`logo-options.html`, `logos/*.svg`) and the tools that
  made them.

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # → dist/
npm run preview      # the built site on http://localhost:4173
```

## Choose the logo

```bash
npm run logo -- b    # a = Receipt One, b = F1 Monogram, c = Fiscal Seal
npm run images       # icon PNGs and the social image (og.png) from that logo
npm run build
```

## Put it online (once)

1. **Firebase project:** <https://console.firebase.google.com> → *Add project* → name
   `fiskone-web` (Google Analytics not needed). If Firebase gives the project another id, put
   that id in `.firebaserc`.
2. **Firestore:** *Build → Firestore Database → Create database*, location
   **eur3 (Europe)**, start in *production mode* (our rules replace the default).
3. **Web app settings:** *Project settings → Your apps → Web (</>)* → register "fiskone.com";
   copy `apiKey`, `authDomain`, `projectId`, `appId` into `src/firebase-config.ts`. These values
   are public by design; `firestore.rules` is what protects the data.
4. **Firebase CLI:** `npm i -g firebase-tools`, then `firebase login`.
5. **Deploy:** `npm run deploy` (builds, then publishes the site and the Firestore rules).
   The site is live at `https://<project-id>.web.app`.
6. **Domain fiskone.com:** *Hosting → Add custom domain* → `fiskone.com` (and `www.fiskone.com`
   redirecting to it). Firebase shows the DNS records (TXT for verification, then A/AAAA): add
   them at your domain registrar. HTTPS certificates come automatically (minutes to a few hours).
7. **Email:** create `info@fiskone.com` with your domain's mail provider (the page shows it).

## Reading contact requests

Firebase console → *Firestore Database* → collection `contactRequests` (newest: sort by
`createdAt`). For an email on every new request, the free plan has no server code; options:
upgrade to the Blaze plan (pay as you go; this volume stays in the free quota) and install the
*Trigger Email* extension, or check the console daily.

## Test the rules

Needs Java 21 (`JAVA_HOME`) and the Firebase CLI:

```bash
npm run test:rules
```

## Updating the site

Edit, `npm run build`, check with `npm run preview`, then `npm run deploy`.
