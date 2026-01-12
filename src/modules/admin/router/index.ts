import LayoutMain from "@/modules/layouts/main.vue";
import LayoutAdminMain from "../layouts/main.vue";

import { routesSecurity } from "../modules/security/router";
import { routesHome } from "../modules/home/router";

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
        children: [...routesHome, ...routesSecurity],
      },
    ],
  },
];
