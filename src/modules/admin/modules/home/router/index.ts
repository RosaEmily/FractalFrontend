import type { RouteRecordRaw } from "vue-router";
import HomePage from "../pages/index.vue";

export const routesHome: RouteRecordRaw[] = [
  {
    path: "",
    name: "admin-home",
    component: HomePage,
  },
];
