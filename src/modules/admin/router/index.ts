import LayoutMain from "@/modules/layouts/main.vue";
import LayoutAdminMain from "../layouts/main.vue";

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

import type { RouteRecordRaw } from "vue-router";

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
         * Los roles del panel se declaran ACÁ, en el padre: vue-router los hace
         * visibles en `to.meta` de toda ruta hija, así que ningún módulo del
         * admin puede nacer sin protección por olvidarse de ponerlos.
         *
         * Hasta sep 2026 solo Home y Reportes llevaban `meta.roles`; los otros
         * ~23 módulos quedaban abiertos a cualquier autenticado, y un STUDENT
         * podía abrir `/admin/security/users` y ver el shell completo del panel.
         *
         * Un módulo que necesite ser más estricto lo redefine en su propia ruta
         * (Reportes ya lo hace con ADMIN a secas) — la meta de la hija gana.
         */
        path: "/admin",
        name: "layout.main.admin",
        component: LayoutAdminMain,
        meta: {
          roles: ["ADMIN", "COORDINATOR", "MANAGER"],
        },
        children: [
          ...routesHome,
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
          ...routesProfile,
        ],
      },
    ],
  },
];
