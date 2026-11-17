const ListPage = () => import("../pages/list.vue");
const CreatePage = () => import("../pages/create.vue");
const EditPage = () => import("../pages/edit.vue");

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Contenido | Patrocinadores |";

export const routesSponsors: RouteRecordRaw[] = [
  {
    path: "sponsors",
    name: "sponsors",
    children: [
      {
        path: "",
        name: "sponsors.list",
        component: ListPage,
        meta: { page: { base: { title: `${TitleBase} Lista` } } },
      },
      {
        path: "create",
        name: "sponsors.create",
        component: CreatePage,
        meta: { page: { base: { title: `${TitleBase} Crear` } } },
      },
      {
        path: "edit/:id",
        name: "sponsors.edit",
        component: EditPage,
        meta: { page: { base: { title: `${TitleBase} Actualizar` } } },
      },
    ],
  },
];
