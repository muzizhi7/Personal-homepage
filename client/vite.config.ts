import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Allow local development to avoid ports owned by other desktop tools.
    proxy: {
      '/api': process.env.VITE_API_PROXY_TARGET || 'http://localhost:8787',
      '/uploads': process.env.VITE_API_PROXY_TARGET || 'http://localhost:8787',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
