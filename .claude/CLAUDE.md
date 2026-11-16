# FractalFrontend — contexto para Claude Code

Front completo de **Fractal Studio** (academia de formación técnica BIM/CAD,
Perú): web pública, compra, backoffice y aula virtual. Su API es
`../fractal-api`.

**Stack:** Vue 3 + TypeScript + Vite 7 · PrimeVue 4 · Pinia · Vue Router 4 ·
Axios · vee-validate + Zod · Tailwind CSS 4 · Day.js · js-cookie.

## Cinco módulos raíz

| Módulo | Ruta | Qué es |
|---|---|---|
| `landing` | `/` | Web pública: home, programas, detalle, instructores, contacto |
| `auth` | `/login`, `/aula/login` | Dos puertas, **un solo componente** parametrizado por `meta.loginVariant` |
| `admin` | `/admin` | Backoffice, 29 módulos |
| `classroom` | `/aula` | Aula virtual, 21 pantallas en 3 roles |
| `checkout` | `/checkout` | Carrito y compra, 7 pantallas |

> **`/checkout` es zona de AULA**, no de panel: quien compra es el alumno y los
> endpoints piden `authorize:STUDENT`. Está en `CLASSROOM_PREFIXES` de
> `shared/utils/session.ts`.

## Patrón de capas (admin y módulos CRUD)

`dto → model → adapter → repository → service → pages → router → menu`

- **Extiende `BaseRepository`** solo lo que es CRUD sobre una entidad.
- **Sin `BaseRepository`** las agregaciones de solo lectura (Dashboard,
  Reportes, casi todo el aula y el checkout).
- **Sin adapter** cuando la API ya devuelve datos planos con los agregados
  calculados; **con adapter** cuando hay que normalizar (MySQL serializa los
  decimales como string).

Componentes genéricos: `SectionList` (ya incluye updated_at, status y acciones)
y `CrudForm`.

En `admin/components/ui/` viven los primitivos del diseño:
`adm-pagination` (paginación con números + elipsis, la usa `GripUi`),
`bulk-bar` (acciones masivas flotantes, la monta `SectionList`),
`form-skeleton` (esqueleto de los formularios de edición),
`role-chips`, `table-skeleton`, `avatar-cell`, `status-pill`,
`mode-toggle` (conmutador Individual/Masivo de las altas),
`bulk-course-card` y `bulk-form-shell` (el marco de los formularios masivos).

⚠️ **El modo masivo NO usa `CrudForm`**: ese componente está atado a un `schema`
de vee-validate fijo, y en un alta masiva el número de filas nace al elegir el
select padre. Por eso existe `bulk-form-shell`, que replica el marco sin el
motor de validación — lo que se valida por fila lo impone el servidor.

Reglas de negocio compartidas: `admin/constants/documents.ts` (DNI/CE/Pasaporte
+ móvil PE, espejo de `Shared/Constant/Document.php` en la API) y
`admin/utils/document-schema.ts`.

## Cómo verificar

```bash
npx vue-tsc -b --force --noEmit | grep -c "error TS"   # baseline: 43 (28-sep-2026)
npx vite build
```

- **ESLint está roto** en el repo desde antes (falla al cargar su config).
- Front local: `local.fractal.com/FractalFrontend/`
- **Sí se puede verificar en navegador**: Chrome headless por CDP
  (`google-chrome --headless=new --remote-debugging-port=9222 ...`). Es la única
  forma de ver cookies HttpOnly y de cazar bugs de render.
- ⚠️ **El login del AULA no se puede automatizar rellenando el formulario**: el
  submit no dispara la petición. La salida es autenticar por `fetch` desde la
  página (`credentials: 'include'`, con **`zone` en el BODY**) y sembrar a mano
  la cookie de perfil `app_user_aula` antes de navegar a `/aula/...`.
  Los botones se llaman distinto en cada puerta: "Acceder al panel" y **"Entrar
  al aula"**.
- ⚠️ **`max_sessions` es 1**: cada intento consume el cupo y el siguiente login
  falla con `MAX_SESSIONS_EXCEEDED` aunque las credenciales estén bien. Limpiar
  `sessions` antes de cada corrida y **restaurar todo lo que se toque**
  (contraseñas, `max_sessions`, filas sembradas).
- Tras editar, el dev server puede servir módulos cacheados:
  `rm -rf node_modules/.vite` en el contenedor + `docker restart
  fractal-front_frontend`. Una recarga con `ignoreCache` NO alcanza.

## Reglas rápidas

- Alias `@` → `src/`; base del router `/FractalFrontend/`.
- Admin: patrón DTO → Adapter → Model → Repository → Service → Page, estricto.
- HTTP: `safeRequest` en las páginas; los servicios propagan los errores.
- Borrado masivo: `POST /ruta/bulk-delete { ids[] }` · estado:
  `PATCH /ruta/actions/update-status { ids[], status }`.
- No agregar columnas `updated_at` / `status` / `actions` en `SectionList`: ya las incluye.

## Documentación (`.claude/rules/`)

Organizada por tipo. Se carga sola, solo al trabajar en los archivos que cubre (`paths:`).

| Carpeta | Qué contiene |
|---|---|
| `project/` | `project` — stack, comandos, CI/CD, variables de entorno |
| `architecture/` | `architecture` (directorios y capas), `patterns` (Repository→Service→Page), `conventions` (código, naming, Zod), `auth` (sesión por zona, guards) |
| `modules/` | `modules` (security, landing), `new-module-guide` (alta de un módulo CRUD), `error-pages` (400–504) |
| `ui/` | `components` (design system), `design` (igualar al diseño), `style-pitfalls`, `component-pitfalls` |
| `api/` | `api-contract` — qué devuelve la API y cómo consumirla |

`.claude/history.md` es el historial fechado de tandas y decisiones; **no** se autocarga, léelo bajo demanda.
