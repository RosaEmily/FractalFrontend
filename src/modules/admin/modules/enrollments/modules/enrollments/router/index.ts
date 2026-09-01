import ListPage from "../pages/list.vue";

import type { RouteRecordRaw } from "vue-router";

/** Solo listado: la API no expone crear ni editar para el admin. */
export const routesEnrollments: RouteRecordRaw[] = [
  {
    path: "enrollments",
    name: "enrollments",
    children: [
      {
        path: "",
        name: "enrollments.list",
        component: ListPage,
        meta: { page: { base: { title: "Académico | Matrículas" } } },
      },
    ],
  },
];
