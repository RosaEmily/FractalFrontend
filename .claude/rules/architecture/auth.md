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
- `getUserRoles` acepta los roles del perfil; sin perfil/roles devuelve una lista vacía, nunca ADMIN por defecto.
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

El backend admite ADMIN/COORDINATOR/MANAGER en login de panel y STUDENT/TEACHER en aula. `admin-home` exige ADMIN; el aula contiene pantallas para COORDINATOR, cuyo rol por sí solo no pasa su login. No describir esas vistas como accesibles de punta a punta hasta alinear `AuthZone`, variantes, guards y rutas API. La aceptación de múltiples roles en un componente no anula la restricción del alta TEACHER+STUDENT.
