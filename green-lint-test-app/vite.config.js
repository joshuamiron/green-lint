import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    // Multi-page app: three separate entry points instead of one combined
    // page, so each fixture set can be visited (and Lighthouse-audited) at
    // its own URL.
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/index.html'),
        unoptimized: resolve(__dirname, 'src/unoptimized.html'),
        optimized: resolve(__dirname, 'src/optimized.html'),
      },
    },
  },
});