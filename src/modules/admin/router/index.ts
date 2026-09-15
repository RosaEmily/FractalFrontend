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
        path: "/admin",
        name: "layout.main.admin",
        component: LayoutAdminMain,
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
