import ListPage from "../pages/list.vue";
import CreatePage from "../pages/create.vue";
import UpdatePage from "../pages/update.vue";

import type { RouteRecordRaw } from "vue-router";

export const routesRoles: RouteRecordRaw[] = [
  {
    path: "roles",
    name: "rol",
    children: [
      {
        path: "",
        name: "rol-list",
        component: ListPage,
      },
      {
        path: "create",
        name: "rol-create",
        component: CreatePage,
      },
      {
        path: "update",
        name: "rol-update",
        component: UpdatePage,
      },
    ],
  },
];
