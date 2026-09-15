import ConfigPage from "../pages/index.vue";

import type { RouteRecordRaw } from "vue-router";

/**
 * Registro único: una sola pantalla que lee y guarda, sin listado ni `:id`.
 */
export const routesSiteConfig: RouteRecordRaw[] = [
  {
    path: "site-config",
    name: "siteConfig",
    component: ConfigPage,
    meta: { page: { base: { title: "Sitio web | Configuración" } } },
  },
];
