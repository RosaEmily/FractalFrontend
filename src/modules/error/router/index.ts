import type { RouteRecordRaw } from "vue-router";
import ErrorPage from "../pages/index.vue";
import LayoutMain from "@/modules/layouts/main.vue";

export const routesError: RouteRecordRaw[] = [
  {
    path: "/",
    component: LayoutMain,
    children: [
      {
        path: "400",
        name: "error-400",
        component: ErrorPage,
        props: { status: 400 },
      },
      {
        path: "401",
        name: "error-401",
        component: ErrorPage,
        props: { status: 401 },
      },
      {
        path: "403",
        name: "error-403",
        component: ErrorPage,
        props: { status: 403 },
      },
      {
        path: "404",
        name: "error-404",
        component: ErrorPage,
        props: { status: 404 },
      },
      {
        path: "500",
        name: "error-500",
        component: ErrorPage,
        props: { status: 500 },
      },
      {
        path: "502",
        name: "error-502",
        component: ErrorPage,
        props: { status: 502 },
      },
      {
        path: "503",
        name: "error-503",
        component: ErrorPage,
        props: { status: 503 },
      },
      {
        path: "/:pathMatch(.*)*",
        name: "not-found",
        component: ErrorPage,
        props: { status: 404 },
      },
    ],
  },
];
