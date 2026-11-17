const ListPage = () => import("../pages/list.vue");
const CreatePage = () => import("../pages/create.vue");
const UpdatePage = () => import("../pages/update.vue");

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Evaluaciones | Notas finales |";

export const routesFinalGrades: RouteRecordRaw[] = [
  {
    path: "final-grades",
    name: "finalGrades",
    children: [
      {
        path: "",
        name: "finalGrades.list",
        component: ListPage,
        meta: { page: { base: { title: `${TitleBase} Lista` } } },
      },
      {
        path: "create",
        name: "finalGrades.create",
        component: CreatePage,
        meta: { page: { base: { title: `${TitleBase} Registrar` } } },
      },
      {
        path: "edit/:id",
        name: "finalGrades.update",
        component: UpdatePage,
        meta: { page: { base: { title: `${TitleBase} Actualizar` } } },
      },
    ],
  },
];
