# Proyecto — Stack y Configuración

## ¿Qué es?

Frontend de **Fractal Studio**, plataforma de formación técnica. Tiene dos zonas:
- **Landing pública**: marketing con programas, instructores, reviews, KPIs, socios, contacto
- **Panel admin** (`/admin`): backoffice con auth JWT y módulos CRUD extensibles

## Stack

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Vue 3 + `<script setup>` + TypeScript | ~5.9 |
| Build | Vite | 7.x |
| Estilos | Tailwind CSS + SCSS | 4.x |
| UI Components | PrimeVue | 4.x |
| Estado | Pinia | 3.x |
| Router | Vue Router | 4.x |
| HTTP | Axios (cliente personalizado `ApiRequest`) | 1.x |
| Formularios | vee-validate + Zod | 4.x / 3.x |
| Fechas | Day.js | 1.x |
| Cookies | js-cookie | 3.x |
| Icons | MDI (`@mdi/js`) + Heroicons + `@jamescoyle/vue-icon` | — |
| Testing | Vitest | 4.x |
| Linting | ESLint 9 + Prettier | — |
| CI/CD | GitHub Actions → GitHub Pages | — |
| Mock | json-server (puerto 4000) | 0.17.x |

## Variables de entorno

Copiar `.env.example` → `.env`:

```env
VITE_API_FRACTAL=""           # URL API v1 (landing)
VITE_API_FRACTAL_V2=""        # URL API v2 admin (sin /v1, el cliente lo agrega)
VITE_COOKIE_NAME_SESSION="app_session"
VITE_COOKIE_NAME_EXPIRES="app_expires_at"
VITE_COOKIE_NAME_USER="app_user"
VITE_APP="local"              # local | dev | prod
VITE_HOME_BASE_URL=""         # Opcional
```

Los valores se exportan desde `src/shared/config/env.config.ts`.

## Comandos

```bash
npm install          # Instalar dependencias
npm run dev          # Dev server (puerto 5173, host 0.0.0.0)
npm run build        # Build producción con type-check (vue-tsc)
npm run build:dev    # Build para rama dev
npm run build:prod   # Build para rama master
npm run preview      # Preview del build local
npm run lint         # ESLint con auto-fix
npm run test         # Vitest (sin tests activos por ahora)
npm run mock         # json-server en puerto 4000
```

## CI/CD

GitHub Actions (`.github/workflows/main.yml`):

- Triggers: push a `master`, `dev`, `feature/*`
- Pipeline: **lint → test → build** (secuencial)
- **deploy-dev**: `dev` → branch `gh-pages-dev`
- **deploy**: `master` → branch `gh-pages`
- Node.js requerido: `20.19.0`
- Secret en repo: `VITE_API_FRACTAL`

## Configuración de Vite

```ts
// vite.config.ts
server: { host: '0.0.0.0', port: 5173, allowedHosts: ['local.fractal.com'] }
base: '/FractalFrontend/'
resolve: { alias: { '@': './src' } }
```
