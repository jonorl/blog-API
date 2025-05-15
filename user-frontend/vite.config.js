import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import * as path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
    server: {
    host: '0.0.0.0',
    port: 8080
  },
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(''), 'src') 
    }
  }
})
