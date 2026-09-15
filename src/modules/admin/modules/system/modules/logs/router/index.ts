import ListPage from "../pages/list.vue";

import type { RouteRecordRaw } from "vue-router";

/** Solo listado: la API expone únicamente index y show. */
export const routesLogs: RouteRecordRaw[] = [
  {
    path: "logs",
    name: "logs",
    children: [
      {
        path: "",
        name: "logs.list",
        component: ListPage,
        meta: { page: { base: { title: "Sistema | Bitácora" } } },
      },
    ],
  },
];
