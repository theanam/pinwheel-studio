import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import tightenCsp from './scripts/csp-plugin.js';
import serviceWorker from './scripts/sw-plugin.js';

// `base` is relative, so one build works under user.github.io/pinwheel/, a custom
// domain or a plain file server with no rewriting.
export default defineConfig({
  base: './',
  plugins: [react(), tightenCsp(), serviceWorker()],
  server: {
    // Pinned: strictPort makes a clash fail loudly instead of silently moving the
    // dev server to another port.
    port: 5185,
    strictPort: true,
  },
  build: {
    target: 'es2022',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Spec §11: keep first paint small. The preset catalogue and the renderer are
        // the two big chunks; splitting them lets the shell paint while they arrive.
        manualChunks(id) {
          if (id.endsWith('/src/presets.js')) return 'presets';
          if (id.endsWith('/src/render.js')) return 'render';
          if (id.includes('/node_modules/react')) return 'react';
        },
      },
    },
  },
});
