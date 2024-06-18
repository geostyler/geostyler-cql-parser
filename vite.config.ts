import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true,
    lib: {
      entry: './src/CqlParser.ts',
      name: 'GeoStyler',
      formats: ['iife'],
      fileName: 'geostyler-cql-parser',
    },
    sourcemap: true,
  },
  define: {
    appName: 'GeoStylerCqlParser'
  },
  server: {
    host: '0.0.0.0'
  }
});
