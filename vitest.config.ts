import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["tests/**/*.test.ts"], // busca tus tests
    passWithNoTests: true, // evita fallar si no hay tests
    threads: false, // evita problemas de fork en Windows
  },
});
