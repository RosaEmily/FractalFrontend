const ListPage = () => import("../pages/list.vue");
const CreatePage = () => import("../pages/create.vue");
const EditPage = () => import("../pages/edit.vue");

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Seguridad | Permisos |";

export const routesPermissions: RouteRecordRaw[] = [
  {
    path: "permissions",
    name: "permissions",
    children: [
      {
        path: "",
        name: "permissions.list",
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
        name: "permissions.create",
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
        name: "permissions.edit",
        component: EditPage,
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
