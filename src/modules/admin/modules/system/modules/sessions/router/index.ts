import ListPage from "../pages/list.vue";

import type { RouteRecordRaw } from "vue-router";

export const routesSystemSessions: RouteRecordRaw[] = [
  {
    path: "sessions",
    name: "systemSessions",
    children: [
      {
        path: "",
        name: "systemSessions.list",
        component: ListPage,
        meta: { page: { base: { title: "Sistema | Sesiones activas" } } },
      },
    ],
  },
];
