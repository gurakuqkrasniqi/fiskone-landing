import { defineConfig, type Plugin } from 'vite';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = __dirname;

/** Every page of the site: index.html, the pages next to it and the guides (udhezues/*.html). */
const pages = Object.fromEntries(
  [
    ...readdirSync(root).filter((f) => f.endsWith('.html')),
    ...readdirSync(resolve(root, 'udhezues')).filter((f) => f.endsWith('.html')).map((f) => `udhezues/${f}`),
  ].map((f) => [f.replace(/\.html$/, '').replace('/', '-'), resolve(root, f)]),
);

/** The shared header and footer, written once in partials/, put into every page. */
function partials(): Plugin {
  const read = (name: string) => readFileSync(resolve(root, 'partials', `${name}.html`), 'utf8');
  return {
    name: 'fiskone-partials',
    // 'pre': before Vite processes the page, so the script in the footer gets bundled.
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replace('<!--#header-->', read('header')).replace('<!--#footer-->', read('footer')),
    },
  };
}

/** Dev server: /vecorite → vecorite.html, like Firebase Hosting's cleanUrls. */
function cleanUrls(): Plugin {
  return {
    name: 'fiskone-clean-urls',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [path, query] = (req.url ?? '/').split('?');
        if (path && path !== '/' && !path.includes('.') && existsSync(resolve(root, `.${path}.html`))) {
          req.url = `${path}.html${query ? `?${query}` : ''}`;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [path, query] = (req.url ?? '/').split('?');
        if (path && path !== '/' && !path.includes('.') && existsSync(resolve(root, 'dist', `.${path}.html`))) {
          req.url = `${path}.html${query ? `?${query}` : ''}`;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [partials(), cleanUrls()],
  build: {
    // No assets inlined as data: URLs (fonts, images): the Content Security Policy in
    // firebase.json allows fonts and scripts from this site only.
    assetsInlineLimit: 0,
    rollupOptions: { input: pages },
  },
});
