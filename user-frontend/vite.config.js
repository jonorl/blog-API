import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import * as path from 'path';

export default defineConfig({
  build: {
    outDir: 'dist', // Must match Nginx's root directory
    emptyOutDir: true,
  },
  // .
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 8080,
  },
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(''), 'src'),
    },
  },
});
