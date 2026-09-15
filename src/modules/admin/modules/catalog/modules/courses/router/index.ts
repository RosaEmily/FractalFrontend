import ListPage from "../pages/list.vue";
import CreatePage from "../pages/create.vue";
import UpdatePage from "../pages/update.vue";

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Catálogo | Cursos |";

export const routesCourses: RouteRecordRaw[] = [
  {
    path: "courses",
    name: "course",
    children: [
      {
        path: "",
        name: "courses.list",
        component: ListPage,
        meta: {
          page: {
            base: {
              title: `${TitleBase} Lista`,
            },
          },
        },
      },
      {
        path: "create",
        name: "courses.create",
        component: CreatePage,
        meta: {
          page: {
            base: {
              title: `${TitleBase} Crear`,
            },
          },
        },
      },
      {
        path: "edit/:id",
        name: "courses.update",
        component: UpdatePage,
        meta: {
          page: {
            base: {
              title: `${TitleBase} Actualizar`,
            },
          },
        },
      },
    ],
  },
];
