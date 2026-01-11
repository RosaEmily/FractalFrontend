import { routesPermissions } from "../modules/permissions/router";
import { routesRoles } from "../modules/roles/router";

import type { RouteRecordRaw } from "vue-router";

export const routesSecurity: RouteRecordRaw[] = [
  {
    path: "security",
    name: "security",
    children: [...routesPermissions, ...routesRoles],
  },
];
