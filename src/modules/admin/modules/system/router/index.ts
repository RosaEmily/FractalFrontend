import { routesLogs } from "../modules/logs/router";
import { routesSystemSessions } from "../modules/sessions/router";

import type { RouteRecordRaw } from "vue-router";

export const routesSystem: RouteRecordRaw[] = [
  {
    path: "system",
    name: "system",
    children: [...routesLogs, ...routesSystemSessions],
  },
];
