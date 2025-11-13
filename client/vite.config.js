import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
      proxy: {
        '/v1': {
          target: 'http://localhost:11434',
          changeOrigin: true,
          secure: false,
        }
      },
          host: '0.0.0.0',  // Allow external connections
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true  // Required for hot reload in Docker
    }
  }
})
