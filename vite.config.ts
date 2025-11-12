import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// Detecta si el build viene de GitHub Actions
const branch = process.env.GITHUB_REF?.split('/').pop()

// Define base según la rama actual
let base = '/FractalFrontend/' // producción por defecto
if (branch === 'dev') {
  base = '/FractalFrontend-dev/'
}

export default defineConfig({
  base,
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})