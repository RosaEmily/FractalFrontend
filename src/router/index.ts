import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

import HomeView from "../views/home/HomeView.vue";

import { routesAuth } from "@/modules/auth/router";

const routes: RouteRecordRaw[] = [
  { path: "/", name: "home", component: HomeView },
  ...routesAuth,
];

const router = createRouter({
  history: createWebHistory("/FractalFrontend/"),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
