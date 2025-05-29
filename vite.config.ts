import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      base: '/markdown-renderer/',
      scope: '/markdown-renderer/',
      manifest: {
        id: 'markdown-renderer',
        name: 'Markdown Document Viewer',
        short_name: 'MD Viewer',
        description: 'View and share Markdown documents instantly',
        theme_color: '#0969da',
        background_color: '#ffffff',
        start_url: '/markdown-renderer/',
        scope: '/markdown-renderer/',
        display: 'standalone',
        icons: [
          {
            src: '/markdown-renderer/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/markdown-renderer/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        navigateFallback: '/markdown-renderer/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/thomasrohde\.github\.io\/markdown-renderer\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'app-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          }
        ]
      }
    })
  ],
  base: '/markdown-renderer/', // CRITICAL for project pages
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'markdown': ['marked', 'dompurify'],
          'diagrams': ['mermaid'],
          'compression': ['pako']
        }
      }
    }
  }
})
