import { defineConfig } from 'vite';

/**
 * Builds the server-side metadata entry.
 *
 * Separate from the app build because this bundle runs in Node, not the
 * browser: no DOM, no CSS, no React. It exists so `server/meta-injector.mjs`
 * (or an edge function in production) can call the same meta builders the
 * client uses.
 */
export default defineConfig({
  build: {
    ssr: true,
    outDir: 'dist-meta',
    emptyOutDir: true,
    target: 'node20',
    rollupOptions: {
      input: 'src/server/meta-entry.ts',
      output: { entryFileNames: 'meta-entry.js', format: 'es' },
    },
  },
});
