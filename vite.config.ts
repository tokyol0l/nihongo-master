import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Конфиг Vite: React + TailwindCSS
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // На GitHub Pages сайт живёт не в корне домена, а в подпапке с именем
  // репозитория — иначе картинки, шрифты и скрипты не найдутся
  base: '/nihongo-master/',
})
