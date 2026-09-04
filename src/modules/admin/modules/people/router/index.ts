import { routesStudents } from "../modules/students/router";
import { routesTeachers } from "../modules/teachers/router";

import type { RouteRecordRaw } from "vue-router";

export const routesPeople: RouteRecordRaw[] = [
  {
    path: "people",
    name: "people",
    children: [...routesTeachers, ...routesStudents],
  },
];
