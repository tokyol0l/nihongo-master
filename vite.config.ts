import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Конфиг Vite: React + TailwindCSS
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
