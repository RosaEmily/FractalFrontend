# Autenticación y Sesión

## Flujo de login

1. Usuario submite email + password en `AuthPage.vue`
2. `authService.login()` → `POST /auth/login` via `authRepository`
3. Respuesta: `{ token, expires_at }`
4. Se guardan dos cookies:
   - `app_session` (o `VITE_COOKIE_NAME_SESSION`) → JWT token
   - `app_expires_at` (o `VITE_COOKIE_NAME_EXPIRES`) → fecha de expiración
5. Router redirige a `admin-home` (o al `redirect` query param)

## Guard de router

`src/router/index.ts` — `router.beforeEach`:

```ts
// meta.auth = true  → requiere cookie válida
if (to.meta.auth && !isAuthenticated) {
  return next({ name: "login", query: { redirect: to.fullPath } });
}

// meta.guestOnly → redirige si ya está autenticado
if (to.meta.guestOnly && isAuthenticated) {
  return next({ name: "admin-home" });
}

// meta.roles: string[] → verifica roles del usuario
if (to.meta.roles) {
  const hasAccess = allowedRoles.some(r => userRoles.includes(r));
  if (!hasAccess) return next({ name: "error-403" });
}
```

**Roles**: se leen de la cookie `roles` (separados por coma). Si no existe la cookie, el guard asume `["ADMIN"]` como fallback (ver `getUserRoles()`).

## Token en requests

`api-fractal.ts` intercepta cada request y agrega:

```
Authorization: Bearer <token_de_cookie>
```

El token se lee de `Cookies.get(COOKIE_NAME_SESSION)` en cada request.

## Sesión expirada (401)

El interceptor de respuesta de `ApiRequest` (`shared/helpers/axios/base.ts`) detecta
el 401 de **cualquier** petición y llama a `handleSessionExpired()`:

1. Borra las tres cookies (`clearSession()` en `shared/utils/session.ts`)
2. Redirige a `login` con `?redirect=<ruta actual>` para volver tras reingresar

```ts
if (httpCode === 401 && data.code !== ErrorCode.INSUFFICIENT_PERMISSIONS) {
  handleSessionExpired();
}
```

**Se decide por el HTTP 401, no por `code: "UNAUTHORIZED"`**: el código viaja en el
body, y ante una caída de la API, un HTML de error o un 401 emitido por un proxy/WAF
no hay body que leer — el usuario quedaría atrapado con la cookie muerta.

**Un 403 NO cierra la sesión.** Los permisos insuficientes son `403` +
`INSUFFICIENT_PERMISSIONS` (`AuthorizationMiddleware` de la API): la sesión es
válida, solo falta el rol.

Detalles:

- `handleSessionExpired` es idempotente: N peticiones en paralelo que fallen con
  401 producen **una sola** redirección.
- Si no hay cookie de sesión no hace nada: un 401 en una pantalla pública o en un
  login fallido lo maneja la propia pantalla.
- La redirección se **inyecta** desde `main.ts` con `setSessionExpiredHandler()`,
  porque el interceptor no puede importar el router sin crear un ciclo
  (router → páginas → servicios → axios).
- `clearSession()` borra pasando `cookieOptions`: sin el mismo `path` js-cookie no
  encuentra la cookie y el borrado falla en silencio.
- `AuthPage` llama a `clearSession()` al montarse, para que no sobreviva la cookie
  de usuario de una sesión anterior.

### useSessionStore (sin uso)

`shared/stores/useSessionStore.ts` y `modules/components/alert/session.vue` existen
pero **no están montados ni se invocan**. Fueron pensados para otro escenario (abrir
el login en otra pestaña vía `HOME_BASE_URL` sin perder el trabajo en curso). El
admin usa la redirección directa descrita arriba.

## Configuración de cookies

`src/shared/config/cookie.config.ts` define `cookieOptions`:
- `sameSite`: configurado para el entorno
- `secure`: según entorno (HTTPS en prod)

## Menú y roles

El menú del admin (`constants/menu/security.ts`) incluye `roles: ["ADMIN"]` por ítem, pero el filtrado visual del menú es independiente del guard del router — ambos deben estar configurados.
