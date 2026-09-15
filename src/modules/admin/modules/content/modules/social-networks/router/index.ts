import ListPage from "../pages/list.vue";
import CreatePage from "../pages/create.vue";
import EditPage from "../pages/edit.vue";

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Contenido | Redes sociales |";

export const routesSocialNetworks: RouteRecordRaw[] = [
  {
    path: "social-networks",
    name: "socialNetworks",
    children: [
      {
        path: "",
        name: "socialNetworks.list",
        component: ListPage,
        meta: { page: { base: { title: `${TitleBase} Lista` } } },
      },
      {
        path: "create",
        name: "socialNetworks.create",
        component: CreatePage,
        meta: { page: { base: { title: `${TitleBase} Crear` } } },
      },
      {
        path: "edit/:id",
        name: "socialNetworks.edit",
        component: EditPage,
        meta: { page: { base: { title: `${TitleBase} Actualizar` } } },
      },
    ],
  },
];
