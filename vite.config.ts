import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 700,
    rollupOptions: {

      output: {
        // Split vendor chunks for better browser caching
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('lenis')) return 'vendor-lenis';
            if (id.includes('@react-oauth')) return 'vendor-oauth';
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
            return 'vendor-core';
          }
        },
        // Stable file hashes for long-term caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Inline small assets directly in CSS to reduce requests
    assetsInlineLimit: 4096,
    // Eliminate dead code in production
    sourcemap: false,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
})


