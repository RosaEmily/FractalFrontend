import ListPage from "../pages/list.vue";
import CreatePage from "../pages/create.vue";
import UpdatePage from "../pages/update.vue";

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Evaluaciones |";

export const routesCourseEvaluations: RouteRecordRaw[] = [
  {
    path: "course-evaluations",
    name: "courseEvaluations",
    children: [
      {
        path: "",
        name: "courseEvaluations.list",
        component: ListPage,
        meta: { page: { base: { title: `${TitleBase} Lista` } } },
      },
      {
        path: "create",
        name: "courseEvaluations.create",
        component: CreatePage,
        meta: { page: { base: { title: `${TitleBase} Crear` } } },
      },
      {
        path: "edit/:id",
        name: "courseEvaluations.update",
        component: UpdatePage,
        meta: { page: { base: { title: `${TitleBase} Actualizar` } } },
      },
    ],
  },
];
