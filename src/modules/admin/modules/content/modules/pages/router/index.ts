import ListPage from "../pages/list.vue";
import CreatePage from "../pages/create.vue";
import EditPage from "../pages/edit.vue";

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Contenido | Páginas |";

export const routesPages: RouteRecordRaw[] = [
  {
    path: "pages",
    name: "pages",
    children: [
      {
        path: "",
        name: "pages.list",
        component: ListPage,
        meta: { page: { base: { title: `${TitleBase} Lista` } } },
      },
      {
        path: "create",
        name: "pages.create",
        component: CreatePage,
        meta: { page: { base: { title: `${TitleBase} Crear` } } },
      },
      {
        path: "edit/:id",
        name: "pages.edit",
        component: EditPage,
        meta: { page: { base: { title: `${TitleBase} Actualizar` } } },
      },
    ],
  },
];
