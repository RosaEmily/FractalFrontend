# FractalFrontend

Panel de administración y landing pública para **Fractal Studio**, plataforma de formación técnica.

## ¿Qué hace este sistema?

El proyecto tiene dos zonas funcionales:

- **Landing pública** — marketing con secciones de programas, instructores, reviews, KPIs, socios y contacto.
- **Panel admin** (`/admin`) — backoffice con autenticación JWT, gestión de seguridad (roles y permisos) y estructura extensible para nuevos módulos CRUD.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Vue 3 + `<script setup>` + TypeScript |
| Build | Vite 7 |
| Estilos | Tailwind CSS 4 + SCSS |
| UI | PrimeVue 4 |
| Estado | Pinia |
| Router | Vue Router 4 |
| HTTP | Axios (cliente personalizado) |
| Formularios | vee-validate 4 + Zod 3 |
| Fechas | Day.js |
| Cookies | js-cookie |
| Icons | MDI + Heroicons |
| Testing | Vitest |
| CI/CD | GitHub Actions → GitHub Pages |

## Setup local

### Requisitos

- Node.js 20.x
- npm

### Instalación

```bash
npm install
```

### Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```env
VITE_API_FRACTAL_V2=""       # URL base de la API (sin /v1 al final — el cliente lo agrega)
VITE_COOKIE_NAME_SESSION="app_session"
VITE_COOKIE_NAME_EXPIRES="app_expires_at"
VITE_COOKIE_NAME_USER="app_user"
VITE_APP="local"
VITE_HOME_BASE_URL=""        # Opcional
```

### Servidor de desarrollo

```bash
npm run dev
# → http://localhost:5173/FractalFrontend/
# También accesible en http://local.fractal.com:5173/FractalFrontend/
```

### Mock server (datos locales)

```bash
npm run mock
# → json-server en http://localhost:4000
```

## Comandos

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build producción con type-check
npm run build:dev    # Build para entorno dev
npm run build:prod   # Build para producción
npm run preview      # Preview del build
npm run lint         # ESLint con auto-fix
npm run test         # Tests unitarios (Vitest)
npm run mock         # Mock server local (json-server)
```

## Arquitectura

### Estructura de directorios

```
src/
├── main.ts                   # Bootstrap de la app
├── router/index.ts           # Router con guards de auth y roles
├── shared/                   # Código compartido
│   ├── components/core/      # Primitivos del design system
│   ├── components/ui/        # Grid (DataTable), modales compuestos
│   ├── composables/          # useFormFields, useClickOutside
│   ├── config/               # Variables de entorno, cookies
│   ├── errors/               # BusinessError, RequestError
│   ├── helpers/axios/        # Cliente HTTP (ApiRequest + instancia api-fractal)
│   ├── interface/            # ApiResponse<T>, PaginationMeta, DataPaginationMeta<T>
│   ├── plugins/directives/   # v-keyfilter, v-trim
│   ├── stores/               # Toast, Alert, Confirm, Loading, Session
│   └── utils/                # safeRequest, zod helpers, format
├── modules/
│   ├── auth/                 # Login y autenticación
│   ├── admin/                # Panel de administración
│   │   ├── components/Section/   # SectionList y CrudForm genéricos
│   │   ├── repositories/         # BaseRepository (abstracto)
│   │   ├── services/             # BaseService (abstracto)
│   │   └── modules/security/     # Módulo de seguridad
│   │       ├── permissions/      # CRUD Permisos
│   │       └── roles/            # CRUD Roles
│   └── landing/              # Landing pública (módulo autónomo)
│       ├── dto/              # DTOs por entidad: general, teacher, offer, footer
│       ├── models/           # Models por entidad
│       ├── adapters/         # Adapters con one() y many()
│       ├── repositories/     # Repositorios por entidad
│       ├── services/         # Servicios por entidad
│       ├── stores/           # useGeneralStore, useOfferStore, useFooterStore
│       ├── composables/      # useCountUp, useIntersectionObserver
│       ├── components/       # Secciones: Banner, Kpis, Courses, Teachers...
│       ├── pages/            # HomeView, ProgramsView, InstructorsView, ContactView
│       ├── layouts/          # LandingLayout.vue
│       └── router/           # Rutas públicas
```

### Patrón de capas

Cada entidad del admin sigue este flujo:

```
API (DTO) → Adapter → Model → Service → Page
```

- **DTO**: forma del JSON de la API
- **Model**: forma interna usada en la UI
- **Adapter**: transforma DTO → Model (`one()` y `many()`)
- **Repository**: extiende `BaseRepository`, define ruta y adapter
- **Service**: extiende `BaseService`, expone métodos de negocio
- **Page**: consume el service vía `SectionList` o `CrudForm`

### Componentes genéricos CRUD

**`SectionList`** — listado con DataTable lazy, filtros, ordenamiento, paginación, acciones masivas (habilitar/deshabilitar/eliminar) y botón de crear. Agrega automáticamente columnas de `updated_at`, `status` y `actions`.

**`CrudForm`** — formulario con validación Zod, manejo de errores de campo del backend, toast de éxito y cancelación.

## Rutas del sistema

```
/                              → Landing Home
/programs                      → Programas
/instructors                   → Instructores
/contact                       → Contacto
/login                         → Login (redirige a /admin si autenticado)
/admin/home                    → Dashboard
/admin/security/permissions    → Lista de permisos
/admin/security/permissions/create   → Crear permiso
/admin/security/permissions/edit/:id → Editar permiso
/admin/security/roles          → Lista de roles
/admin/security/roles/create   → Crear rol
/admin/security/roles/edit/:id → Editar rol
```

## Autenticación

- JWT almacenado en cookie (`app_session` por defecto)
- Guard en router: `meta.auth = true` requiere cookie válida
- Control de roles: `meta.roles: string[]` verifica contra cookie `roles`
- Modal de sesión expirada con reintento automático de la última request

## Cómo agregar un módulo CRUD

1. Crear `src/modules/admin/modules/{dominio}/modules/{entidad}/`
2. Definir `dto/entity.dto.ts` (forma del JSON de la API)
3. Definir `models/entity.model.ts` (`interface Entity` + `EntityRepositoryTypes`)
4. Crear `adapters/entity.adapter.ts` con `{ one(), many() }`
5. Crear `repositories/entity.repository.ts` extendiendo `BaseRepository<EntityRepositoryTypes>`
6. Crear `services/entity.service.ts` extendiendo `BaseService`
7. Crear páginas: `list.vue`, `create.vue`, `update.vue`
8. Crear `router/index.ts` y registrarlo en el módulo padre
9. Agregar ítem al menú en `src/modules/admin/constants/menu/`

## Convenciones

- Componentes con `<script setup lang="ts">` siempre
- Alias `@` → `src/`
- Base URL del router: `/FractalFrontend/` (GitHub Pages)
- Nombres de permisos/roles: `MAYUSCULAS_CON_GUION_BAJO`
- Las páginas del admin consumen services, nunca HTTP directo
- `safeRequest` para wrappear calls en componentes (no lanza, devuelve `{ status, data, error }`)
- Bulk delete: `POST /route/bulk-delete` con `{ ids: [] }`
- Cambio de estado: `PATCH /route/actions/update-status` con `{ ids: [], status: 0|1 }`

## CI/CD

GitHub Actions (`.github/workflows/main.yml`):
- **lint → test → build** en cada push a `master`, `dev`, `feature/*`
- **deploy-dev**: `dev` → branch `gh-pages-dev`
- **deploy**: `master` → branch `gh-pages`

Secret requerido en el repo: `VITE_API_FRACTAL`

## Troubleshooting

**El servidor dev no carga en el navegador**
Asegúrate de acceder con la base URL: `http://localhost:5173/FractalFrontend/`

**Error 401 en las llamadas al admin**
Verifica que `VITE_API_FRACTAL_V2` esté configurado sin `/v1` al final (el cliente lo agrega).

**Los filtros del DataTable no persisten entre recargas**
El estado se guarda en `sessionStorage` con key `dt-fractal`. Limpiar el storage del navegador los resetea.

**El mock server no arranca**
Verifica que existan `mock/db.json` y `mock/routes.json`. El json-server usa la versión `0.17.x` (no la v1).

**Build falla con errores de tipos**
El build incluye `vue-tsc` con check estricto. Asegúrate de que todos los types estén definidos antes de hacer build.
