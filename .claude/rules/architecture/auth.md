---
paths:
  - "src/modules/auth/**"
  - "src/router/**"
  - "src/shared/utils/session.ts"
  - "src/shared/helpers/axios/**"
---

# Autenticación y sesión por zona

Fuentes: `src/shared/utils/session.ts`, `src/router/index.ts`, `src/main.ts`, `src/shared/helpers/axios/api-fractal.ts` y `src/modules/auth/`.

## Login y persistencia

1. `AuthPage.vue` selecciona variante mediante `meta.loginVariant`.
2. `POST auth/login` envía email, password y `zone` (`admin` o `classroom`) en el cuerpo. El header por sí solo no elige la puerta del login.
3. El backend entrega cookie HttpOnly de su zona y JSON con `expires_at`, `zone` y `roles`; no entrega un token usable en `data.token`.
4. Se consulta el perfil y se guardan cookies visibles con sufijo de zona: perfil y caducidad. Las del aula usan sufijo `aula`; la preferencia de rol es otra cookie.
5. Se navega al redirect pendiente o al inicio permitido. El aula elige entre sus roles disponibles.

No JWT ni token accesible por JS. Las cookies de perfil sirven para presentación/navegación; pueden ser alteradas por el cliente y no conceden permisos de API.

## Peticiones

Axios utiliza `withCredentials: true`. En cada request añade `X-Fractal-Zone` según el path actual. `/aula` y `/checkout` son zona classroom; `/admin` es admin. El helper acepta rutas del router y paths con la base `/FractalFrontend`.

Las dos cookies HttpOnly viajan juntas al backend porque ambas tienen path `/`; el header desambigua la sesión. CORS debe permitir el origen real y credenciales. No sustituir este mecanismo por un interceptor Bearer leyendo una cookie de JS.

## Guard y recuperación

- `meta.auth` requiere perfil de esa zona o recuperación mediante `auth/me`.
- Sin perfil, se intenta recuperar una vez por zona y carga de página antes de redirigir. El token HttpOnly puede seguir vigente.
- `getUserRoles` acepta los roles del perfil (solo el aula; el panel usa permisos, ver abajo); sin perfil/roles devuelve una lista vacía, nunca ADMIN por defecto.
- `guestOnly` devuelve al inicio de la zona únicamente cuando hay sesión utilizable en esa zona.
- Si el perfil no permite la ruta, el guard lo descarta en esa zona y dirige a su login con el destino pendiente. Un usuario con varios roles de aula puede cambiar la vista al entrar en una ruta de otro de sus roles.
- La API sigue siendo la autoridad: validar cookie de perfil o menú no autoriza operaciones.

## Caducidad y errores

El 401 llama a `handleSessionExpired`: limpia cookies visibles de la zona y redirige una sola vez mediante el callback inyectado desde `main.ts`. Un 403 no cierra la sesión. La duración real la fija el backend desde el login; navegar/editar perfil no la renueva.

`clearSession` no borra la cookie HttpOnly. El logout debe pasar por la API para revocar la sesión y expirar esa cookie. No hay reintento automático general de la última mutación después del login; el store/modal heredado no es el flujo montado actualmente.

429/500/502/503/504 usan pantalla completa, salvo `background` en la configuración de una petición. Importaciones usa esa excepción para conservar avance y manejar sus reintentos; 401 conserva la gestión de caducidad.

## Perfil reactivo del aula

`classroom/composables/useClassroomRole.ts` mantiene un ref compartido. `syncClassroomUser` relee la cookie en login/recuperación; `updateClassroomUser` actualiza ref y persistencia conservando caducidad. Un computed sobre `Cookies.get` no reacciona a cambios externos.

## Matriz pendiente de alinear

El backend admite en el panel los roles base ADMIN/COORDINATOR/MANAGER y cualquier rol propio de zona `admin`; en el aula STUDENT/TEACHER. El aula contiene pantallas para COORDINATOR, cuyo rol por sí solo no pasa su login. No describir esas vistas como accesibles de punta a punta hasta alinear `AuthZone`, variantes, guards y rutas API. La aceptación de múltiples roles en un componente no anula la restricción del alta TEACHER+STUDENT.

## Permisos del panel

El panel se controla por **permisos**, no por nombre de rol (`/admin` ya no lleva `meta.roles`).

- `auth/me` devuelve `permissions`: `["*"]` para ADMIN y los nombres exactos para el resto (`[]` en el aula). **No van en la cookie de perfil** (una cookie pasa de ~4 KB con un rol de ~100 permisos y el navegador la descarta en silencio): `setSessionUser` los separa y los guarda en `localStorage` (`getSessionPermissions`). `null` significa «no sé, pregunta a la API»; `[]`, «no tiene ninguno».
- `src/modules/admin/constants/permissions.ts` es la tabla ruta → permiso (`users.list` → `USERS_VIEW`, `.create` → `_CREATE`, `.edit`/`.update` → `_UPDATE`, `reports.x` → `REPORTS_X_VIEW`). `withPermissions` la aplica a `meta.permission` al armar el router. **Es un espejo del catálogo del backend** (`Permissions`/`PermissionModules`): al agregar un recurso, agregarlo en `RESOURCE_BY_ROUTE`.
- Guard: el padre `/admin` lleva `meta.panel` (exige algún permiso). Una pantalla **sin** `meta.permission` y sin `meta.anyPanelUser` se **cierra** (403): un módulo nuevo no nace abierto. Solo `profile.show` es abierta. Sin permiso de «Inicio» se redirige a la primera pantalla permitida.
- Menú (`filterMenuByPermissions`) y botones salen del mismo mapeo: los ítems del menú ya no declaran `roles`. `SectionList` oculta crear/editar/estado/eliminar según `useResourcePermissions()`; las acciones propias (revocar sesión, destacar, atendido, responder) leen `useUserStore().can(...)`.
- ⚠️ Todo esto es UX: la API autoriza cada petición. Pruebas en `tests/access-control.test.ts` (cada pantalla tiene permiso, el menú coincide con el guard).
- Permisos: la pantalla de crear existe y los botones crear/estado/eliminar salen solo con `PERMISSIONS_*` (el backend exige además ADMIN y bloquea por fila los del catálogo con `rowLocked`/`isSystem`). De un permiso del catálogo solo se edita la descripción.
- Los enlaces del Inicio (avisos, «Ver todas») solo son enlace si el usuario puede abrir el destino. `SectionList` no ofrece selección de filas si no hay acción masiva permitida.
- Menú de usuario: muestra la descripción del rol (`roleDescriptions` del adaptador de `auth/me`; el login solo trae nombres, así que se pide el perfil una vez) y un chevron que indica abierto/cerrado.
