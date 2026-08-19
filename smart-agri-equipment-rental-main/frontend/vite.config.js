import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5174,
    allowedHosts: ['.loca.lt'],
    proxy: {
      // Proxy all /api requests to the Express backend — eliminates CORS preflight overhead
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})