import AuthPage from "../pages/AuthPage.vue";
import type { RouteRecordRaw } from "vue-router";

export const routesAuth: RouteRecordRaw[] = [
  { path: "/login", name: "login", component: AuthPage },
];
