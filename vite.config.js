import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', 
      includeAssets: ['kintag-logo.png', 'apple-touch-icon.png', 'favicon.ico'],
      manifest: {
        name: 'KinTag Digital Safety',
        short_name: 'KinTag',
        description: 'The ultimate digital safety net for your family.',
        theme_color: '#18181b', 
        background_color: '#fafafa', 
        display: 'standalone', 
        orientation: 'portrait',
        icons: [
          { src: '/kintag-logo.png', sizes: '192x192', type: 'image/png' },
          { src: '/kintag-logo.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallbackDenylist: [/^\/api/], 
        // 🌟 FIXED: This tells the PWA to absorb Firebase so they don't fight!
        importScripts: ['/firebase-messaging-sw.js'], 
      }
    })
  ]
})
