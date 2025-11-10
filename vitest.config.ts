import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'], // busca tus tests
    passWithNoTests: true,           // evita fallar si no hay tests
    threads: false,                  // evita problemas de fork en Windows
  },
})