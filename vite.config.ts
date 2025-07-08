import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Solo usar base para GitHub Pages, comentar para Render
  base: process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES 
    ? "/Esp32PanelControlReact/" 
    : "/",
  plugins: [react()],
  
  // Configuración del servidor para desarrollo
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
      },
    },
  },
  
  // Configuración para preview
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  
  // Configuración de build para optimizar chunks
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar React en su propio chunk
          react: ['react', 'react-dom'],
          // Separar Chart.js
          charts: ['chart.js', 'react-chartjs-2', 'recharts'],
          // Separar otras librerías
          vendor: ['@tanstack/react-query', 'framer-motion', 'react-router-dom'],
          // Separar utilidades
          utils: ['date-fns', 'clsx', 'zod', 'react-hook-form'],
        }
      }
    }
  }
})