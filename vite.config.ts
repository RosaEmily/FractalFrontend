import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

const securityPolicy = (): Plugin => {
  let apiOrigin = "";
  return {
    name: "fractal-security-policy",
    apply: "build",
    configResolved(config) {
      const base = config.env.VITE_API_FRACTAL_V2;
      if (base) {
        const api = new URL(base);
        if (!["https:", "http:"].includes(api.protocol)) {
          throw new Error("VITE_API_FRACTAL_V2 debe ser una URL HTTP o HTTPS.");
        }
        apiOrigin = api.origin;
      }
    },
    transformIndexHtml() {
      const content = [
        "default-src 'self'",
        "script-src 'self'",
        `connect-src 'self' ${apiOrigin}`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' https: data: blob:",
        "worker-src 'self' blob:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ");
      return [{ tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content }, injectTo: "head-prepend" }];
    },
  };
};

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    cors: {
      origin: [
        "http://local.fractal.com",
        "https://local.fractal.com",
        "http://local.fractal.com:5173",
        "https://local.fractal.com:5173",
      ],
    },
    allowedHosts: ["local.fractal.com"],
    fs: {
      strict: true,
      allow: [path.resolve(__dirname)],
      deny: [
        ".env",
        ".env.*",
        "*.{crt,pem,key}",
        "**/.git/**",
        "**/.ssh/**",
        "**/.aws/**",
      ],
    },
  },
  // reemplaza por el nombre exacto de tu repo en GitHub
  base: "/FractalFrontend/",
  plugins: [vue(), securityPolicy()],
  worker: { format: "es" },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
