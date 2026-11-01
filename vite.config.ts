import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // No assets inlined as data: URLs (fonts, images): the Content Security Policy in
    // firebase.json allows fonts and scripts from this site only.
    assetsInlineLimit: 0,
  },
});
