import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import obfuscator from 'vite-plugin-javascript-obfuscator'
import fs from 'fs'

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

// Middleware para servir imágenes de vehículos locales
function vehiculosImagenesServer() {
  return {
    name: 'vehiculos-imagenes-server',
    configureServer(server: any) {
      return () => {
        server.middlewares.use('/vehiculos lavadero/', (req: any, res: any, next: any) => {
          const filepath = path.join(__dirname, 'vehiculos lavadero', req.url)
          
          // Validar que el archivo existe y está dentro de la carpeta permitida
          try {
            const realpath = path.resolve(filepath)
            const allowed = path.resolve(__dirname, 'vehiculos lavadero')
            
            if (!realpath.startsWith(allowed)) {
              res.statusCode = 403
              res.end('Forbidden')
              return
            }

            if (fs.existsSync(realpath) && fs.statSync(realpath).isFile()) {
              const content = fs.readFileSync(realpath)
              const ext = path.extname(realpath).toLowerCase()
              
              // Set MIME types
              const mimeTypes: Record<string, string> = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.webp': 'image/webp',
                '.avif': 'image/avif',
                '.jfif': 'image/jpeg',
              }
              
              res.setHeader('Content-Type', mimeTypes[ext] || 'image/jpeg')
              res.setHeader('Cache-Control', 'public, max-age=3600')
              res.end(content)
              return
            }
          } catch (error) {
            console.error('Error serving image:', error)
          }
          
          next()
        })
      }
    },
  }
}

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? './' : '/',
  plugins: [
    gaunaAssetResolver(),
    vehiculosImagenesServer(),
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
