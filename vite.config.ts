
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // IMPORTANT: This 'base' must match your repository name on GitHub
  base: '/omni-work/',
  define: {
    // This allows process.env to work in the browser if needed by some older libs
    'process.env': {}
  }
});
