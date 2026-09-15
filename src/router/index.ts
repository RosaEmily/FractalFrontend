import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

import { safeJsonParse } from "@/shared/utils/safe-json";
import {
  clearSession,
  getSessionUserRaw,
  hasSession,
  restoreSessionUser,
  roleNames,
  zoneFromPath,
  type AppZone,
} from "@/shared/utils/session";
import meService from "@/modules/admin/services/auth.service";

import { routesLanding } from "@/modules/landing/router";
import { routesAuth } from "@/modules/auth/router";
import { routesAdmin } from "@/modules/admin/router";
import { routesClassroom } from "@/modules/classroom/router";
import { routesCheckout } from "@/modules/checkout/router";
import { routesError } from "@/modules/error/router";
import { applyPageMeta } from "@/shared/utils/meta";

const routes: RouteRecordRaw[] = [
  ...routesLanding,
  ...routesAuth,
  ...routesAdmin,
  ...routesClassroom,
  ...routesCheckout,
  ...routesError,
];

const router = createRouter({
  history: createWebHistory("/FractalFrontend/"),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

/**
 * Roles del usuario EN UNA ZONA, leídos de la cookie de perfil de esa zona.
 *
 * Antes se leían de una cookie `roles` que nadie escribía nunca, y el fallback
 * devolvía ["ADMIN"]: `meta.roles` dejaba pasar a cualquier autenticado. Con
 * tres roles reales (alumno, docente, coordinación) eso ya no es viable.
 *
 * Y hasta sep 2026 la cookie era una sola para las dos zonas, así que los roles
 * del aula se evaluaban contra las rutas del panel. Ahora la zona sale del path
 * y cada una consulta su propia cookie.
 *
 * Sin cookie de usuario se devuelve [], no un rol por defecto: es preferible
 * un 403 mientras carga el perfil que abrir una pantalla que no corresponde.
 */
const getUserRoles = (zone: AppZone): string[] => {
  const user = safeJsonParse<{ roles?: unknown }>(getSessionUserRaw(zone));

  if (!user || typeof user === "string") {
    return [];
  }

  // `auth/me` los devuelve como objetos {name, description}; `roleNames`
  // acepta ambas formas — comparar contra el objeto daba 403 siempre.
  return roleNames(user.roles);
};

/**
 * Zonas cuyo perfil ya se intentó recuperar en esta carga de página.
 *
 * Evita que una sesión realmente muerta dispare un `auth/me` por cada
 * navegación: si el primer intento falla, se deja de preguntar.
 */
const recoveryTried = new Set<AppZone>();

/**
 * Rescata la sesión cuando falta la cookie de PERFIL pero puede quedar token.
 *
 * La sesión son dos cookies: la HttpOnly que emite el backend (invisible para
 * el JS) y la de perfil que escribe el login. Si la segunda se pierde —el login
 * falló entre un paso y otro, se borró a mano, caducó antes— el guard concluía
 * "no hay sesión" y mandaba al login **aunque el token siguiera vivo**. El
 * usuario quedaba encerrado: entraba, volvía al login, y otra vez.
 *
 * Ahora se le pregunta a la API una vez. Si el token sirve, se rehace el perfil
 * y la navegación continúa; si no, `auth/me` responde 401 y se sigue al login,
 * que es el comportamiento correcto.
 *
 * ⚠️ Se intenta UNA sola vez por zona y carga de página: sin ese tope, un
 * usuario sin sesión dispararía una petición en cada navegación.
 */
const tryRecoverSession = async (zone: AppZone): Promise<boolean> => {
  if (recoveryTried.has(zone)) return false;
  recoveryTried.add(zone);

  try {
    const user = await meService.me();
    if (!user) return false;

    restoreSessionUser(zone, user);
    return true;
  } catch {
    // 401/403/red caída: no hay sesión que rescatar, sigue el flujo normal.
    return false;
  }
};

router.beforeEach(async (to, _, next) => {
  // Page
  if (to.meta.page) {
    applyPageMeta(to.meta.page);
  }

  /*
   * La ZONA de la ruta de destino decide qué sesión se consulta. Sale del path,
   * no de la cookie: pedir `/admin/...` pregunta por la sesión del panel exista
   * o no la del aula, que es lo que impide que una sirva para entrar a la otra.
   *
   * En las pantallas de login la zona la fija la variante, porque `/login` y
   * `/aula/login` no comparten prefijo con la zona que abren.
   */
  const zone: AppZone = to.meta.loginVariant
    ? (to.meta.loginVariant as AppZone)
    : zoneFromPath(to.path);

  /*
   * El token es HttpOnly: el guard no puede verlo. Se usa la cookie de perfil
   * de esa zona como señal, y la API responde 401 si la sesión real no vale —
   * el interceptor se encarga de esa redirección.
   */
  let isAuthenticated = hasSession(zone);

  /*
   * Sin perfil pero con ruta protegida: puede ser una sesión a medias, no una
   * ausencia de sesión. Se comprueba contra la API antes de rebotar.
   */
  if (!isAuthenticated && (to.meta.auth || to.meta.guestOnly)) {
    isAuthenticated = await tryRecoverSession(zone);
  }

  const userRoles = getUserRoles(zone);

  /*
   * Ya autenticado en la pantalla de invitado DE SU PROPIA ZONA: se lo devuelve
   * adentro. Estar logueado en el aula no es motivo para saltarse el login del
   * panel — son sesiones distintas y puede querer abrir la segunda.
   */
  if (to.meta.guestOnly && isAuthenticated) {
    return next({ name: zone === "admin" ? "admin-home" : "classroom-home" });
  }

  /*
   * 🔒 Auth — el login al que se manda es el DE LA ZONA que se intentó abrir:
   * quien pide `/admin/...` sin sesión de panel va al login del panel, aunque
   * tenga el aula abierta. Mandarlo al del aula lo devolvería a donde ya está,
   * sin explicarle por qué no entró.
   */
  if (to.meta.auth && !isAuthenticated) {
    return next({
      name: zone === "classroom" ? "classroom-login" : "login",
      query: {
        redirect: to.fullPath,
      },
    });
  }

  /*
   * 🔐 Roles.
   *
   * Un rol que no corresponde a ESTA zona no es un 403: es una sesión que no
   * sirve acá. El 403 sería un callejón sin salida — la pantalla no ofrece
   * ninguna acción para recuperarse, y con el perfil equivocado guardado
   * tampoco se puede llegar al login, porque el guard corta antes.
   *
   * Pasó de verdad: mientras el backend resolvía mal la cookie (ver el header
   * `X-Fractal-Zone`), entrar al aula guardaba el perfil del ADMIN bajo la
   * cookie del aula. Con eso, `/aula` daba 403 para siempre y `/aula/login`
   * era inalcanzable.
   *
   * Por eso se descarta la sesión de esta zona y se manda a su login: es la
   * única salida, y es correcta — quien tiene el perfil equivocado necesita
   * volver a autenticarse.
   */
  if (to.meta.roles) {
    const allowedRoles = to.meta.roles as string[];
    const hasAccess = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasAccess) {
      /*
       * El perfil no sirve para esta zona: al descartarlo hay que permitir un
       * nuevo intento de rescate, o el siguiente login quedaría sin red.
       */
      recoveryTried.delete(zone);
      clearSession(zone);

      return next({
        name: zone === "classroom" ? "classroom-login" : "login",
        query: {
          redirect: to.fullPath,
        },
      });
    }
  }

  next();
});

export default router;
