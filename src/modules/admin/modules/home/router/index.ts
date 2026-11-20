import type { RouteRecordRaw } from "vue-router";
const HomePage = () => import("../pages/index.vue");

export const routesHome: RouteRecordRaw[] = [
  {
    path: "",
    name: "admin-home",
    component: HomePage,
    meta: {
      page: {
        base: {
          title: "Home",
        },
      },
    },
  },
];
