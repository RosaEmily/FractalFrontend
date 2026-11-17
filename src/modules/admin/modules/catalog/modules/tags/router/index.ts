const ListPage = () => import("../pages/list.vue");
const CreatePage = () => import("../pages/create.vue");
const UpdatePage = () => import("../pages/update.vue");

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Catálogo | Etiquetas |";

export const routesTags: RouteRecordRaw[] = [
  {
    path: "tags",
    name: "tags",
    children: [
      {
        path: "",
        name: "tags.list",
        component: ListPage,
        meta: { page: { base: { title: `${TitleBase} Lista` } } },
      },
      {
        path: "create",
        name: "tags.create",
        component: CreatePage,
        meta: { page: { base: { title: `${TitleBase} Crear` } } },
      },
      {
        path: "edit/:id",
        name: "tags.update",
        component: UpdatePage,
        meta: { page: { base: { title: `${TitleBase} Actualizar` } } },
      },
    ],
  },
];
