import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND = 'http://127.0.0.1:8080'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': { target: BACKEND, changeOrigin: true },
      '/healthz': { target: BACKEND, changeOrigin: true },
      '/readyz': { target: BACKEND, changeOrigin: true },
      '/openapi.json': { target: BACKEND, changeOrigin: true },
    },
  },
})