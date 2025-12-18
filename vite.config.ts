
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Vercel usually serves from the root. Use '/' instead of a subfolder.
  base: '/',
  define: {
    // Vite uses import.meta.env, but some libs look for process.env
    'process.env': {}
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
