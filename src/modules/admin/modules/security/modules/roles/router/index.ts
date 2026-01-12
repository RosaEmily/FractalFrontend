import ListPage from "../pages/list.vue";
import CreatePage from "../pages/create.vue";
import UpdatePage from "../pages/update.vue";

import type { RouteRecordRaw } from "vue-router";

export const routesRoles: RouteRecordRaw[] = [
  {
    path: "roles",
    name: "role",
    children: [
      {
        path: "",
        name: "role.list",
        component: ListPage,
      },
      {
        path: "create",
        name: "role.create",
        component: CreatePage,
      },
      {
        path: "update",
        name: "role.update",
        component: UpdatePage,
      },
    ],
  },
];
