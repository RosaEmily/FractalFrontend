const ListPage = () => import("../pages/list.vue");
const CreatePage = () => import("../pages/create.vue");
const UpdatePage = () => import("../pages/update.vue");

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Catálogo | Monedas |";

export const routesCurrencies: RouteRecordRaw[] = [
  {
    path: "currencies",
    name: "currencies",
    children: [
      {
        path: "",
        name: "currencies.list",
        component: ListPage,
        meta: { page: { base: { title: `${TitleBase} Lista` } } },
      },
      {
        path: "create",
        name: "currencies.create",
        component: CreatePage,
        meta: { page: { base: { title: `${TitleBase} Crear` } } },
      },
      {
        path: "edit/:id",
        name: "currencies.update",
        component: UpdatePage,
        meta: { page: { base: { title: `${TitleBase} Actualizar` } } },
      },
    ],
  },
];
