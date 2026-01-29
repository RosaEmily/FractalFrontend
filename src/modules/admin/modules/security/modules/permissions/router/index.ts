import ListPage from "../pages/list.vue";
import CreatePage from "../pages/create.vue";
import UpdatePage from "../pages/update.vue";

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Seguridad | Permisos |";

export const routesPermissions: RouteRecordRaw[] = [
  {
    path: "permissions",
    name: "permission",
    children: [
      {
        path: "",
        name: "permission.list",
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
        name: "permission.create",
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
        name: "permission.edit",
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
