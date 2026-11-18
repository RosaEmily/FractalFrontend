# FractalFrontend

Frontend de Fractal Studio, academia de formación técnica BIM/CAD en Perú.

Contexto contrastado con el código local el **18 de noviembre de 2026**. Incluye cambios todavía sin commit; no describe necesariamente el despliegue activo.

## Áreas de la aplicación

| Área | Rutas principales | Función |
|---|---|---|
| Web pública | `/`, `/programs`, `/programs/:id`, `/instructors`, `/instructors/:documentNumber`, `/contact`, `/info/:slug`, `/libro-de-reclamaciones` | Catálogo, contenido, contacto y reclamaciones |
| Acceso | `/login`, `/aula/login` | Un formulario con variante por zona |
| Administración | `/admin` y sus módulos | Inicio, catálogo, personas, seguridad, operación académica, contenido, reportes y sistema |
| Aula | `/aula` | Alumno, docente y pantallas de coordinación |
| Compra | `/checkout` | Carrito, validación y compra del alumno; utiliza la sesión del aula |
| Estados | `src/modules/error/router/index.ts` | Pantallas de error y ruta no encontrada |

Las rutas anteriores son relativas al router. En el navegador llevan la base `/FractalFrontend/`. El inicio del panel es `/admin`, no `/admin/home`.

## Stack y ejecución

Vue 3, TypeScript 5.9, Vite 7, Tailwind CSS 4/SCSS, PrimeVue 4, Pinia 3, Vue Router 4, Axios, vee-validate 4/Zod 3, Day.js, js-cookie y MDI/Heroicons. XLSX se lee con `read-excel-file` dentro de un Web Worker, cargado al utilizar la importación.

Node compatible con Vite 7: 20.19+ o 22.12+; el workflow fija 20.19.0. Instalar dependencias con `npm install`.

| Comando | Efecto |
|---|---|
| `npm run dev` | Vite en puerto 5173; usar el dominio `local.fractal.com` |
| `npm run build` | `vue-tsc -b` y después Vite |
| `npm run build:dev`, `npm run build:prod` | Mismo control de tipos, con base `/FractalFrontend/` |
| `npm run test` | Vitest; existen pruebas de importación, CSV/XLSX y equivalencia del preset |
| `npm run lint` | ESLint con `--fix`; modifica archivos |
| `npm run preview` | Sirve el build para revisión local |
| `npm run mock` | Servidor de datos ficticios de desarrollo |

Última verificación de esta sesión: Vite compila; el build completo sigue bloqueado por 63 errores TypeScript preexistentes. Esto no equivale a una compilación de producción aprobada.

## Configuración

`src/shared/config/env.config.ts` exporta los nombres de configuración. No colocar credenciales en variables `VITE_*`: forman parte del frontend público.

- `VITE_API_FRACTAL_V2`: base de la API, incluyendo `/api` si corresponde y **sin** `/v1`; `api-fractal.ts` agrega `/v1`. La usa también la landing.
- `VITE_COOKIE_NAME_USER`, `VITE_COOKIE_NAME_EXPIRES`: prefijos del perfil y la caducidad visibles por zona.
- `VITE_APP`, `VITE_HOME_BASE_URL`: opciones de entorno disponibles en el módulo de configuración.
- `VITE_API_FRACTAL` y `VITE_COOKIE_NAME_SESSION` siguen exportadas por compatibilidad; no son la fuente de la autenticación actual.

`vite.config.ts` permite `local.fractal.com`, enumera orígenes HTTP/HTTPS con o sin el puerto 5173 y restringe los archivos servidos al repositorio. `host: 0.0.0.0` permite el acceso desde el proxy de Docker. Los filtros Host/CORS no autentican usuarios ni garantizan que el servidor de desarrollo sea privado; revisar la exposición del proxy por separado.

## Arquitectura y contratos

- `src/router/index.ts`: composición de módulos, metadatos, guards y recuperación de sesión.
- `src/shared/`: cliente HTTP, errores, componentes core/UI, validadores, stores y utilidades.
- `src/modules/admin/`: `BaseRepository`, `BaseService`, `SectionList`, `CrudForm` y módulos funcionales.
- `src/modules/{landing,auth,classroom,checkout,error}/`: páginas y capas propias.
- `src/style.css`: tokens de diseño; `shared/constants/primevue.ts` y `primevue-preset.ts`: personalización y selección de componentes Aura.

En CRUD: página → servicio → repositorio → API; el repositorio adapta DTO → modelo. Las agregaciones de aula, reportes y checkout tienen repositorios específicos. El servicio extrae `data` del sobre `{ success, error, data }`.

El grid CRUD envía `page` desde 1 y `limit`; recibe `data.items` y `data.meta`. El listado público de programas también recibe `items/meta`; `OfferAdapter` lo transforma a `offers` en el modelo. No confundir esos niveles. Importaciones usa `offset` como índice de fila y páginas fijas de 25.

## Sesión y permisos

No se utiliza JWT. El servidor genera un token opaco, guarda su SHA-256 y lo entrega únicamente en cookies HttpOnly separadas: `fractal_admin_session` y `fractal_aula_session`.

Axios utiliza `withCredentials` y el header `X-Fractal-Zone`. El login envía `zone` en el cuerpo. JavaScript solo guarda perfil, caducidad y preferencia de rol; esas cookies no conceden permisos en la API. El guard no tiene un rol ADMIN por defecto y recupera el perfil mediante `auth/me` una vez por zona/carga cuando falta.

Un 401 limpia el perfil de esa zona y lleva a su login; un 403 no cierra la sesión. Los 429/500/502/503/504 llevan a la pantalla de estado salvo peticiones marcadas `background`, como la importación. No existe reintento automático general de mutaciones tras reautenticar.

## Importación de personas

Estudiantes y docentes usan `admin/components/ui/bulk-import.vue` y `admin/modules/people/shared/import/`. Solo ADMIN. Acepta XLSX (primera hoja), CSV/TSV y pegado desde Excel; hasta 50.000 registros y archivos de 20 MB.

El worker lee, valida, normaliza y detecta duplicados. La UI mantiene solo 25 filas de vista previa; envía las válidas en lotes de hasta 1.000 filas/1 MB. La API guarda el avance y ejecuta trabajos de 25 registros, con cuatro líneas de trabajo. Los reintentos de subida y creación son idempotentes. El enlace con `?import=<id>` permite consultar, pausar y continuar tras recargar.

En la prueba aislada del worker, 50.000 filas se analizaron en aproximadamente 0,8 s (CSV) y 1,3 s (XLSX); la API estaba simulada en esa comprobación de navegador. Es una medición local de análisis/preview, no el tiempo completo de creación.

El envío del archivo requiere mantener la pantalla abierta; después de encolarse, la creación continúa en el servidor. Las contraseñas temporales se generan allí, se guardan cifradas y solo salen en el reporte. La disponibilidad dura 72 horas desde la creación de la importación.

## Contexto versionado

- [.claude/CLAUDE.md](.claude/CLAUDE.md): entrada al contexto para asistentes.
- [.claude/rules/architecture](.claude/rules/architecture): arquitectura, autenticación, patrones y convenciones.
- [.claude/rules/modules/modules.md](.claude/rules/modules/modules.md): áreas funcionales y contratos.
- [.claude/rules/api/api-contract.md](.claude/rules/api/api-contract.md): integración con la API.
- [.claude/rules/ui](.claude/rules/ui): reglas de diseño y componentes.

Estos archivos pertenecen al repositorio. Los prototipos del workspace son referencias de diseño, no prueba de que una función esté implementada ni requisito para clonar este repo.

## CI/CD y pendientes comprobados

`.github/workflows/main.yml` ejecuta lint y test en `master`, `dev` y `feature/*`; build y publicación solo en `master/dev`. Publica `gh-pages` y `gh-pages-dev`.

- El workflow configura `VITE_API_FRACTAL`, pero el cliente activo necesita `VITE_API_FRACTAL_V2`.
- Usa `npm ci`, pero `package-lock.json` no está versionado y está ignorado: hace falta resolver la instalación reproducible antes de confiar en CI.
- El login admite MANAGER/COORDINATOR en el panel, pero `admin-home` exige ADMIN. Hay pantallas del aula para COORDINATOR y su login no admite ese rol por sí solo. La matriz de acceso necesita alineación; no ampliar permisos por suposición.
- Importaciones requiere la migración, cola persistente, workers y scheduler del backend. No se ha verificado su activación en el servidor compartido.
