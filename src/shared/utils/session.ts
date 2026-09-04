import Cookies from "js-cookie";
import {
  COOKIE_NAME_SESSION,
  COOKIE_NAME_EXPIRES,
  COOKIE_NAME_USER,
} from "@/shared/config/env.config";
import { cookieOptions } from "@/shared/config/cookie.config";

/** Borra las tres cookies de sesión. */
export const clearSession = () => {
  // El borrado debe usar las mismas opciones con las que se escribieron:
  // js-cookie no encuentra la cookie si el `path` no coincide.
  Cookies.remove(COOKIE_NAME_SESSION, cookieOptions);
  Cookies.remove(COOKIE_NAME_EXPIRES, cookieOptions);
  Cookies.remove(COOKIE_NAME_USER, cookieOptions);
};

/**
 * Cierra la sesión cuando la API responde 401 (token inválido o expirado) y
 * manda al login conservando la ruta actual para volver tras reingresar.
 *
 * Vive aquí y no en el interceptor de axios porque el interceptor no puede
 * importar el router sin crear un ciclo (router → páginas → servicios →
 * axios). `redirectToLogin` lo inyecta main.ts una vez creado el router.
 */
let redirectToLogin: ((redirect: string) => void) | null = null;

export const setSessionExpiredHandler = (
  handler: (redirect: string) => void,
) => {
  redirectToLogin = handler;
};

/** Evita que N peticiones en paralelo disparen N redirecciones. */
let expiring = false;

export const handleSessionExpired = () => {
  if (expiring) return;

  // Sin cookie de sesión no hay nada que expirar: el 401 viene de una
  // pantalla pública o de un login fallido, que muestra su propio error.
  if (!Cookies.get(COOKIE_NAME_SESSION)) return;

  expiring = true;
  clearSession();

  const current = window.location.pathname + window.location.search;
  redirectToLogin?.(current);

  // Se libera en el siguiente tick: para entonces la navegación ya ocurrió y
  // las peticiones en vuelo que fallen después no vuelven a redirigir.
  setTimeout(() => {
    expiring = false;
  }, 0);
};
