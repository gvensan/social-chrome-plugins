import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { crx } from '@crxjs/vite-plugin';
import manifest from './src/manifest.json' with { type: 'json' };

export default defineConfig({
  plugins: [svelte(), crx({ manifest })],
  resolve: {
    alias: {
      '@lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
      '@popup': fileURLToPath(new URL('./src/popup', import.meta.url)),
      '@toolkit/core': fileURLToPath(
        new URL('../core/src/index.ts', import.meta.url)
      ),
      '@toolkit/core/components': fileURLToPath(
        new URL('../core/src/components', import.meta.url)
      ),
      '@toolkit/core/stores': fileURLToPath(
        new URL('../core/src/stores', import.meta.url)
      ),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 5180,
    strictPort: true,
    hmr: { port: 5180 },
  },
});
