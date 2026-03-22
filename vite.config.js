import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('react')) return 'vendor-react';
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    host: true,
    port: 5173,
    // ── COOP/CORS fix for Google sign-in popup on localhost ──────────────────
    // Without these headers, Chrome blocks the OAuth popup because the default
    // COOP policy is 'same-origin' which prevents cross-origin window messaging
    // that Firebase's signInWithPopup relies on.
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
  },
})
