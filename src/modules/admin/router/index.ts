const LayoutMain = () => import("@/modules/layouts/main.vue");
const LayoutAdminMain = () => import("../layouts/main.vue");

import { routesSecurity } from "../modules/security/router";
import { routesCatalog } from "../modules/catalog/router";
import { routesHome } from "../modules/home/router";
import { routesReports } from "../modules/reports/router";
import { routesProfile } from "../modules/profile/router";
import { routesPeople } from "../modules/people/router";
import { routesContent } from "../modules/content/router";
import { routesEvaluations } from "../modules/evaluations/router";
import { routesPayments } from "../modules/payments/router";
import { routesJobs } from "../modules/jobs/router";
import { routesCertification } from "../modules/certification/router";
import { routesAcademic } from "../modules/enrollments/router";
import { routesSystem } from "../modules/system/router";

import { withPermissions } from "../constants/permissions";

import type { RouteRecordRaw } from "vue-router";

/** Primera pantalla real (con nombre) de un grupo de rutas. */
const firstLeafName = (route: RouteRecordRaw): string | symbol | undefined => {
  const first = route.children?.[0];
  return first ? firstLeafName(first) : route.name;
};

/**
 * Un grupo sin componente (`/admin/catalog`, `/admin/people`…) solo agrupa
 * rutas: abrirlo a mano o desde un enlace dejaba la página en BLANCO. Se
 * redirige a su primera pantalla en vez de declarar un redirect por módulo.
 */
const withGroupRedirect = (route: RouteRecordRaw): RouteRecordRaw => {
  if (!route.children?.length) return route;
  const children = route.children.map(withGroupRedirect);
  if (route.component || route.redirect) return { ...route, children } as RouteRecordRaw;
  const name = firstLeafName({ ...route, children } as RouteRecordRaw);
  return (name
    ? { ...route, children, redirect: { name } }
    : { ...route, children }) as RouteRecordRaw;
};

export const routesAdmin: RouteRecordRaw[] = [
  {
    path: "",
    name: "layout.main",
    component: LayoutMain,
    meta: {
      auth: true,
    },
    children: [
      {
        /*
         * El acceso al panel se decide por PERMISOS, no por nombre de rol: un
         * rol propio (p. ej. «OPERADOR») entra con los permisos que tenga.
         *
         * `panel` va en el padre y vue-router lo hace visible en `to.meta` de
         * toda ruta hija: exige al menos un permiso. Cada pantalla trae el suyo
         * (`meta.permission`, asignado por `withPermissions` según su nombre) y
         * una pantalla SIN permiso ni `anyPanelUser` se cierra: un módulo nuevo
         * no puede nacer abierto por olvidarse de declararlo.
         *
         * ⚠️ Es UX. La API autoriza cada petición por su cuenta.
         */
        path: "/admin",
        name: "layout.main.admin",
        component: LayoutAdminMain,
        meta: {
          panel: true,
        },
        children: [
          ...routesHome.map(withPermissions),
          ...[
            ...routesReports,
            ...routesCatalog,
            ...routesSecurity,
            ...routesPeople,
            ...routesContent,
            ...routesEvaluations,
            ...routesPayments,
            ...routesJobs,
            ...routesCertification,
            ...routesAcademic,
            ...routesSystem,
          ].map(withGroupRedirect).map(withPermissions),
          ...routesProfile.map(withPermissions),
        ],
      },
    ],
  },
];
