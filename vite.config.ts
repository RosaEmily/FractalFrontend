import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    cors: true,

    allowedHosts: ["local.fractal.com"],
  },
  // reemplaza por el nombre exacto de tu repo en GitHub
  base: "/FractalFrontend/",
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
