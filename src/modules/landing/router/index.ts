import type { RouteRecordRaw } from "vue-router";

export const routesLanding: RouteRecordRaw[] = [
  {
    path: "",
    name: "home",
    component: () => import("../pages/HomeView.vue"),
  },
  {
    path: "/programs",
    name: "programs",
    component: () => import("../pages/ProgramsView.vue"),
  },
  {
    path: "/instructors",
    name: "instructors",
    component: () => import("../pages/InstructorsView.vue"),
  },
  {
    path: "/programs/:id",
    name: "program-detail",
    component: () => import("../pages/ProgramDetailView.vue"),
  },
  {
    path: "/contact",
    name: "contact",
    component: () => import("../pages/ContactView.vue"),
  },
];
