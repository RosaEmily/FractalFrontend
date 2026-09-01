import { routesEnrollments } from "../modules/enrollments/router";
import { routesClassSessions } from "../modules/class-sessions/router";

import type { RouteRecordRaw } from "vue-router";

export const routesAcademic: RouteRecordRaw[] = [
  {
    path: "academic",
    name: "academic",
    children: [...routesEnrollments, ...routesClassSessions],
  },
];
