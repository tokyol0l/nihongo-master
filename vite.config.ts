import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Конфиг Vite: React + TailwindCSS
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // На GitHub Pages сайт живёт не в корне домена, а в подпапке с именем
  // репозитория — иначе картинки, шрифты и скрипты не найдутся. В Android
  // (Capacitor) всё лежит в корне приложения, поэтому там нужен base: './'
  // — переключаем через переменную окружения BUILD_TARGET=android
  base: process.env.BUILD_TARGET === 'android' ? './' : '/nihongo-master/',
})
