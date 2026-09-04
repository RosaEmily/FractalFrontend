import Cookies from "js-cookie";
import { COOKIE_NAME_EXPIRES, COOKIE_NAME_USER } from "@/shared/config/env.config";
import { cookieOptions } from "@/shared/config/cookie.config";

/**
 * Sesión del lado del cliente, SEPARADA POR ZONA.
 *
 * ⚠️ El TOKEN no se toca desde acá: vive en una cookie HttpOnly que emite y
 * borra el backend, una por zona (`fractal_admin_session` /
 * `fractal_aula_session`). El JavaScript no puede leerlo ni eliminarlo, que es
 * justamente el punto — un XSS no alcanza para robarlo.
 *
 * Lo que sí maneja el front son dos cookies sin valor secreto, y ambas llevan
 * el sufijo de su zona:
 *  - `app_user_{zona}`       → perfil y roles, para pintar el menú y el guard.
 *  - `app_expires_at_{zona}` → cuándo caduca, para no mostrar una sesión muerta.
 *
 * ⚠️ Antes eran UNA sola cookie en `path=/` que las dos zonas se pisaban. El
 * backend ya emitía dos sesiones independientes, pero el cliente las colapsaba
 * en una: entrar al aula dejaba `app_user` puesta y el guard del panel la leía
 * como "hay sesión", así que un STUDENT abría `/admin/...` y veía el shell del
 * panel entero. Solo la API lo frenaba, pantalla por pantalla.
 *
 * La separación va en el NOMBRE, no en el `path`: el `path` de una cookie se
 * compara contra la URL que se pide, y estas las lee el JS del front en
 * cualquier ruta. Es la misma razón por la que las del backend van en `/`.
 */

export type AppZone = "admin" | "classroom";

/**
 * Header con el que cada petición declara su zona.
 *
 * Las dos cookies de sesión van en `path=/`, así que el navegador las manda
 * juntas y el backend no puede deducir cuál usar: sin esta señal tomaba la del
 * panel y el aula respondía con la identidad del admin. El valor debe coincidir
 * con `AuthZone::ZONE_HEADER` de la API.
 */
export const ZONE_HEADER = "X-Fractal-Zone";

/** Nombres reales de las cookies visibles de una zona. */
const userCookie = (zone: AppZone): string =>
  `${COOKIE_NAME_USER}_${zone === "admin" ? "admin" : "aula"}`;

const expiresCookie = (zone: AppZone): string =>
  `${COOKIE_NAME_EXPIRES}_${zone === "admin" ? "admin" : "aula"}`;

/** Base del router, el subpath de GitHub Pages. */
const ROUTER_BASE = "/FractalFrontend";

/**
 * A qué zona pertenece una ruta.
 *
 * Es lo único que decide qué sesión se consulta, y sale del PATH — no de la
 * cookie ni del rol. Así, pedir `/admin/...` pregunta siempre por la sesión
 * del panel, exista o no la del aula.
 *
 * ⚠️ Acepta tanto la ruta del router (`/aula/cursos`) como la del navegador
 * (`/FractalFrontend/aula/cursos`): `window.location.pathname` incluye el base
 * y `route.path` no. Sin quitar el prefijo, todo el aula se leería como panel.
 *
 * `/aula/login` cuenta como aula: el login pide `auth/me` ANTES de navegar a la
 * zona, así que resolverlo como panel haría que el aula cargara el perfil de la
 * sesión de admin abierta.
 *
 * `/checkout` también es zona de aula aunque no cuelgue de `/aula`: quien compra
 * es el alumno, la matrícula se crea contra su ficha de estudiante y los
 * endpoints piden `authorize:STUDENT`. Resolverlo como panel mandaría la cookie
 * del admin y toda la compra respondería 401.
 */
const CLASSROOM_PREFIXES = ["/aula", "/checkout"];

export const zoneFromPath = (path: string): AppZone => {
  const normalized = path.startsWith(ROUTER_BASE)
    ? path.slice(ROUTER_BASE.length)
    : path;

  return CLASSROOM_PREFIXES.some((prefix) => normalized.startsWith(prefix))
    ? "classroom"
    : "admin";
};

/**
 * Nombres de rol de un perfil, venga como venga.
 *
 * ⚠️ **`auth/me` devuelve los roles como OBJETOS** (`[{name, description}]`),
 * porque la UI muestra la descripción y no el nombre técnico. Varios tipos del
 * front los declaran como `string[]`, así que un `roles.includes("STUDENT")`
 * daba **siempre false** y toda ruta con `meta.roles` respondía 403 — incluso
 * al usuario correcto.
 *
 * Se acepta cualquiera de las dos formas: el tipo declarado no coincide con lo
 * que llega, y normalizar es más barato que perseguir cada consumidor.
 */
export const roleNames = (roles: unknown): string[] => {
  if (!Array.isArray(roles)) return [];

  return roles
    .map((role) =>
      typeof role === "string" ? role : (role as { name?: string })?.name,
    )
    .filter((name): name is string => Boolean(name));
};

/** Perfil crudo guardado para esa zona, o null. */
export const getSessionUserRaw = (zone: AppZone): string | undefined =>
  Cookies.get(userCookie(zone));

/** Guarda el perfil y la caducidad de UNA zona, sin tocar la otra. */
export const setSessionUser = (
  zone: AppZone,
  user: string,
  expiresAt: string | Date,
) => {
  const expires = new Date(expiresAt);

  Cookies.set(expiresCookie(zone), new Date(expiresAt).toISOString(), {
    expires,
    ...cookieOptions,
  });
  Cookies.set(userCookie(zone), user, { expires, ...cookieOptions });
};

/** Caducidad guardada para esa zona. */
export const getSessionExpires = (zone: AppZone): string | undefined =>
  Cookies.get(expiresCookie(zone));

/**
 * Borra las cookies visibles de UNA zona. La de sesión la borra el backend en
 * el logout — y también solo la suya, así que cerrar el aula deja el panel
 * abierto y viceversa.
 */
export const clearSession = (zone: AppZone) => {
  // El borrado usa las mismas opciones con las que se escribieron: js-cookie
  // no encuentra la cookie si el `path` no coincide.
  Cookies.remove(expiresCookie(zone), cookieOptions);
  Cookies.remove(userCookie(zone), cookieOptions);
};

/** Si el cliente cree tener sesión EN ESA ZONA. La palabra final la tiene la API. */
export const hasSession = (zone: AppZone): boolean =>
  Boolean(Cookies.get(userCookie(zone)));

/**
 * Cierra la sesión cuando la API responde 401 (token inválido o expirado) y
 * manda al login conservando la ruta actual para volver tras reingresar.
 *
 * Vive aquí y no en el interceptor de axios porque el interceptor no puede
 * importar el router sin crear un ciclo (router → páginas → servicios →
 * axios). `redirectToLogin` lo inyecta main.ts una vez creado el router.
 */
let redirectToLogin: ((redirect: string) => void) | null = null;

/**
 * Lleva a la pantalla de estado del código dado.
 *
 * Vive aquí por el mismo motivo que `redirectToLogin`: el interceptor de axios
 * no puede importar el router sin crear un ciclo. `main.ts` lo inyecta.
 */
let showErrorScreen: ((status: number) => void) | null = null;

export const setErrorScreenHandler = (handler: (status: number) => void) => {
  showErrorScreen = handler;
};

/**
 * Códigos que la pantalla de destino no puede resolver por su cuenta.
 *
 * Un 422 o un 409 los muestra el formulario junto al campo que falló, que es
 * más útil que sacar al usuario de donde está. Estos otros no dejan nada que
 * hacer en la pantalla actual: o el servidor no responde, o hay que esperar.
 */
const FULL_SCREEN_ERRORS = [429, 500, 502, 503, 504];

/** Evita que N peticiones fallidas en paralelo naveguen N veces. */
let showingError = false;

export const handleHttpError = (status: number) => {
  if (!FULL_SCREEN_ERRORS.includes(status) || showingError) return false;

  showingError = true;
  showErrorScreen?.(status);
  setTimeout(() => {
    showingError = false;
  }, 0);

  return true;
};

export const setSessionExpiredHandler = (
  handler: (redirect: string) => void,
) => {
  redirectToLogin = handler;
};

/** Evita que N peticiones en paralelo disparen N redirecciones. */
let expiring = false;

export const handleSessionExpired = () => {
  if (expiring) return;

  /*
   * El 401 se atribuye a la zona que el usuario está mirando: es la sesión que
   * se acaba de usar. Limpiar ambas cerraría de paso la otra, que puede estar
   * perfectamente viva — el backend las mantiene independientes.
   */
  const zone = zoneFromPath(window.location.pathname);

  // Sin rastro de sesión no hay nada que expirar: el 401 viene de una pantalla
  // pública o de un login fallido, que muestra su propio error.
  if (!hasSession(zone)) return;

  expiring = true;
  clearSession(zone);

  const current = window.location.pathname + window.location.search;
  redirectToLogin?.(current);

  // Se libera en el siguiente tick: para entonces la navegación ya ocurrió y
  // las peticiones en vuelo que fallen después no vuelven a redirigir.
  setTimeout(() => {
    expiring = false;
  }, 0);
};
