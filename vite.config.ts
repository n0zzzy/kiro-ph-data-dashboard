import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// DuckDB-WASM requires these headers for SharedArrayBuffer support
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@duckdb/duckdb-wasm'],
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy':   'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
