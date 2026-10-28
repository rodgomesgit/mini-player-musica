import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// O build do app Android (Capacitor) serve os arquivos a partir da raiz do
// WebView, então usa base '/'. O build padrão continua com o caminho do GitHub Pages.
export default defineConfig(({ mode }) => ({
  base: mode === 'android' ? '/' : '/mini-player-musica/',
  plugins: [react(), tailwindcss()],
}))
