import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Repo GitHub Pages (project page, bukan azin-kun.github.io) di-serve dari
// subpath /SukarameApp/, bukan root domain — lihat log.md Fase 7.
const base = '/SukarameApp/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Mie Ayam Sukarame',
        short_name: 'Sukarame',
        description: 'Mie Ayam Sukarame — pesan online & kasir/admin',
        lang: 'id',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#1A0A00',
        theme_color: '#1A0A00',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Termasuk gambar/font supaya halaman customer (/, /order) bisa
        // dipakai offline minimal (lihat log.md Fase 6). Admin tetap butuh
        // koneksi ke Supabase untuk berfungsi walau shell-nya ikut ter-cache.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        navigateFallback: `${base}index.html`,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
})
