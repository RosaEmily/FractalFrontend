import ListPage from "../pages/list.vue";
import CreatePage from "../pages/create.vue";
import UpdatePage from "../pages/update.vue";

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Evaluaciones | Notas |";

export const routesStudentEvaluations: RouteRecordRaw[] = [
  {
    path: "student-evaluations",
    name: "studentEvaluations",
    children: [
      {
        path: "",
        name: "studentEvaluations.list",
        component: ListPage,
        meta: { page: { base: { title: `${TitleBase} Lista` } } },
      },
      {
        path: "create",
        name: "studentEvaluations.create",
        component: CreatePage,
        meta: { page: { base: { title: `${TitleBase} Registrar` } } },
      },
      {
        path: "edit/:id",
        name: "studentEvaluations.update",
        component: UpdatePage,
        meta: { page: { base: { title: `${TitleBase} Actualizar` } } },
      },
    ],
  },
];
