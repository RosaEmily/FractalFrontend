import type { RouteRecordRaw } from "vue-router";
import { ERROR_CODES } from "../constants/codes";

/*
 * Pantallas de estado, una ruta por código (400–504).
 *
 * Se generan desde `ERROR_CODES` en vez de escribirlas a mano: eran 7 de los 14
 * del diseño, y agregar un código nuevo obligaba a tocar dos archivos y era
 * fácil olvidarse de uno.
 *
 * ⚠️ NO llevan layout: son pantalla completa con su propia cabecera, como el
 * diseño. Envolverlas en el layout de la landing metería el header y el footer
 * del sitio dentro de un 500.
 */
const ErrorPage = () => import("../pages/index.vue");

export const routesError: RouteRecordRaw[] = [
  ...Object.keys(ERROR_CODES).map((code) => ({
    path: `/${code}`,
    name: `error-${code}`,
    component: ErrorPage,
    props: { status: Number(code) },
    meta: { page: { base: { title: `Error ${code}` } } },
  })),
  {
    /*
     * Catch-all. Va al final: cualquier ruta no registrada cae aquí, y la URL
     * fallida se conserva en pantalla para que el usuario vea si se equivocó al
     * escribirla.
     */
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: ErrorPage,
    props: { status: 404 },
    meta: { page: { base: { title: "Página no encontrada" } } },
  },
];
