import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'maskable-icon-512x512.png',
        'data/hsk_master_dictionary.json'
      ],
      manifest: {
        name: 'BiHua 筆畫 - Chinese Stroke Order Master',
        short_name: 'BiHua 筆畫',
        description: 'Master Chinese characters, stroke orders, and HSK 1-6 vocabulary offline with interactive stroke animations and flashcards.',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // Precache build files and dictionary JSON
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6MB to cache hsk_master_dictionary.json (1.5MB)
        runtimeCaching: [
          {
            // Cache stroke vector JSON files on demand with CacheFirst strategy
            urlPattern: ({ url }) => url.pathname.startsWith('/stroke/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'bihua-stroke-cache',
              expiration: {
                maxEntries: 2500,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Google Fonts Stylesheet
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets'
            }
          },
          {
            // Google Fonts Webfonts
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('motion')) {
              return 'vendor-framework';
            }
            if (id.includes('hanzi-writer')) {
              return 'vendor-hanzi';
            }
            if (id.includes('lucide-react') || id.includes('canvas-confetti')) {
              return 'vendor-ui';
            }
            return 'vendor-misc';
          }
          if (id.includes('src/data/hsk-words.json')) {
            return 'data-words';
          }
          if (id.includes('src/data/hsk-chars.json')) {
            return 'data-chars';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
});
