import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// O build do app Android (Capacitor) serve os arquivos a partir da raiz do
// WebView, então usa base '/'. O build padrão continua com o caminho do GitHub Pages.
// A página de admin (admin.html) só vai pro site, não pro APK.
export default defineConfig(({ mode }) => ({
  base: mode === 'android' ? '/' : '/mini-player-musica/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input:
        mode === 'android'
          ? { main: resolve(import.meta.dirname, 'index.html') }
          : {
              main: resolve(import.meta.dirname, 'index.html'),
              admin: resolve(import.meta.dirname, 'admin.html'),
            },
    },
  },
}))
