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

## Sesión expirada

Cuando el backend responde 401:
1. `ApiRequest` convierte el error en `BusinessError`
2. El componente que llamó a `safeRequest` recibe `{ status: false, error }`
3. `useSessionStore.openSessionModal(retryFn)` muestra el modal de sesión
4. El usuario puede renovar la sesión y el modal llama `retryLastRequest()` que reejercuta la función original

## useSessionStore

```ts
const session = useSessionStore();
session.openSessionModal(async () => {
  // función que se reintentará tras renovar sesión
  await reloadData();
});
```

## Configuración de cookies

`src/shared/config/cookie.config.ts` define `cookieOptions`:
- `sameSite`: configurado para el entorno
- `secure`: según entorno (HTTPS en prod)

## Menú y roles

El menú del admin (`constants/menu/security.ts`) incluye `roles: ["ADMIN"]` por ítem, pero el filtrado visual del menú es independiente del guard del router — ambos deben estar configurados.
