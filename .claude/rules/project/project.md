---
paths:
  - "package.json"
  - "vite.config.ts"
  - ".github/**"
  - "Dockerfile*"
---

# Proyecto — stack y configuración

Contexto contrastado con el código local el 18-nov-2026. Ver `README.md` para instalación, límites y pendientes; no representa el estado del despliegue.

## Áreas y stack

Fractal Studio incluye web pública, acceso, administración, aula, checkout y pantallas de estado. Vue 3 con TypeScript 5.9, Vite 7, Tailwind 4/SCSS, PrimeVue 4, Pinia 3, Vue Router 4, Axios, vee-validate 4/Zod 3, Day.js y js-cookie. `read-excel-file` se carga bajo demanda en un worker para XLSX. Vitest tiene pruebas activas. ESLint 9 usa `eslint.config.js`.

## Configuración

Los nombres se exportan desde `src/shared/config/env.config.ts`; ningún `VITE_*` debe contener secretos porque queda expuesto en el cliente.

- `VITE_API_FRACTAL_V2`: base HTTP para toda la aplicación, incluida landing. El cliente agrega `/v1`; incluir `/api` en la base cuando corresponda.
- `VITE_COOKIE_NAME_USER`, `VITE_COOKIE_NAME_EXPIRES`: prefijos del perfil y caducidad por zona, no del token HttpOnly.
- `VITE_APP`, `VITE_HOME_BASE_URL`: opciones exportadas de entorno.
- `VITE_API_FRACTAL`, `VITE_COOKIE_NAME_SESSION`: exportaciones heredadas; no dirigen el cliente ni la autenticación actuales.

Vite: base `/FractalFrontend/`, alias `@` a `src`, puerto 5173 estricto, `worker.format: es`. `host: 0.0.0.0` permite que Docker/Traefik llegue al proceso. `allowedHosts` contiene el dominio exacto `local.fractal.com`; CORS enumera HTTP/HTTPS con y sin 5173. `fs.strict` limita archivos al repo y `fs.deny` bloquea patrones sensibles. Estos filtros no autentican ni prueban que el proxy sea privado.

## Ejecución y CI

- `npm run dev`: Vite; acceder por el dominio del proyecto.
- `npm run build`, `build:dev`, `build:prod`: primero `vue-tsc -b`, luego Vite.
- `npm run test`: Vitest; CSV/XLSX, importación y preset.
- `npm run lint`: ESLint con `--fix`, modifica archivos.
- `npm run preview`: revisión del build. `npm run mock`: datos ficticios.

El workflow fija Node 20.19.0 y corre lint → test en `master`, `dev`, `feature/*`; build/publicación solo en `master/dev`, a `gh-pages`/`gh-pages-dev`. Pendientes comprobados: usa `npm ci` sin lockfile versionado y configura `VITE_API_FRACTAL` aunque el cliente utiliza `VITE_API_FRACTAL_V2`. No considerar CI validado hasta resolverlo.
