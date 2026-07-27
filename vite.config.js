import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    react(),
    VitePWA({
      // Disable PWA service worker while developing to avoid caching delays
      devOptions: {
        enabled: false,
        /* When enabled:true you can test the PWA locally */
      },
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'CoordCamp',
        short_name: 'CoordCamp',
        description: 'Premium University Attendance & Campus Life Portal',
        theme_color: '#8B1A1A',
        background_color: '#F8F5F0',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
