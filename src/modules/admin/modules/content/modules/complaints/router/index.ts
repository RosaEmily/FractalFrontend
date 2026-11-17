const ListPage = () => import("../pages/list.vue");

import type { RouteRecordRaw } from "vue-router";

export const routesComplaints: RouteRecordRaw[] = [
  {
    path: "complaints",
    name: "complaints",
    children: [
      {
        path: "",
        name: "complaints.list",
        component: ListPage,
        meta: { page: { base: { title: "Contenido | Libro de reclamaciones | Lista" } } },
      },
    ],
  },
];
