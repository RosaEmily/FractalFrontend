import ListPage from "../pages/list.vue";
import CreatePage from "../pages/create.vue";
import UpdatePage from "../pages/update.vue";

import type { RouteRecordRaw } from "vue-router";

export const routesPermissions: RouteRecordRaw[] = [
  {
    path: "permissions",
    name: "permission",
    children: [
      {
        path: "",
        name: "permission-list",
        component: ListPage,
      },
      {
        path: "create",
        name: "permission-create",
        component: CreatePage,
      },
      {
        path: "update",
        name: "permission-update",
        component: UpdatePage,
      },
    ],
  },
];
