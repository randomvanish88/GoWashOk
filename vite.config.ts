import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import obfuscator from 'vite-plugin-javascript-obfuscator'

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)



function gaunaAssetResolver() {
  return {
    name: 'gauna-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('gauna:asset/')) {
        const filename = id.replace('gauna:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? './' : '/',
  plugins: [
    gaunaAssetResolver(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  server: {
    port: 5173,
    // Sirve el build de la PWA en /pwa/*
    proxy: {},
    fs: { allow: ['..'] },
  },
}))
