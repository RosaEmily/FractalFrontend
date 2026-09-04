import ListPage from "../pages/list.vue";
import CreatePage from "../pages/create.vue";
import UpdatePage from "../pages/update.vue";

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Académico | Clases |";

export const routesClassSessions: RouteRecordRaw[] = [
  {
    path: "class-sessions",
    name: "classSessions",
    children: [
      {
        path: "",
        name: "classSessions.list",
        component: ListPage,
        meta: { page: { base: { title: `${TitleBase} Lista` } } },
      },
      {
        path: "create",
        name: "classSessions.create",
        component: CreatePage,
        meta: { page: { base: { title: `${TitleBase} Programar` } } },
      },
      {
        path: "edit/:id",
        name: "classSessions.update",
        component: UpdatePage,
        meta: { page: { base: { title: `${TitleBase} Actualizar` } } },
      },
    ],
  },
];
