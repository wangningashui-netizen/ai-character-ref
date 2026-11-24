import fs from 'node:fs'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const COMFYUI_URL = process.env.COMFYUI_URL || 'http://127.0.0.1:8000'

function pagesFallback(): Plugin {
  return {
    name: 'github-pages-404',
    closeBundle() {
      const indexPath = path.resolve('dist/index.html')
      if (fs.existsSync(indexPath)) fs.copyFileSync(indexPath, path.resolve('dist/404.html'))
    },
  }
}

const comfyProxy = {
  '/comfy': {
    target: COMFYUI_URL,
    changeOrigin: true,
    ws: true,
    rewrite: (p: string) => p.replace(/^\/comfy/, '') || '/',
    configure: (proxy: any) => {
      proxy.on('proxyReq', (proxyReq: any) => proxyReq.removeHeader('origin'))
      proxy.on('proxyReqWs', (proxyReq: any) => proxyReq.removeHeader('origin'))
    },
  },
}

export default defineConfig({
  base: '/ai-character-ref/',
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    pagesFallback(),
  ],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'tanstack-vendor', test: /node_modules[\\/]@tanstack[\\/]/ },
            { name: 'ui-vendor', test: /node_modules[\\/](radix-ui|@radix-ui|lucide-react|sonner)[\\/]/ },
          ],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: comfyProxy,
  },
  preview: {
    port: 4173,
    proxy: comfyProxy,
  },
})
