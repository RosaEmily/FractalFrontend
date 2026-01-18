import AuthPage from "../pages/AuthPage.vue";
import LayoutMain from "@/modules/layouts/main.vue";
import type { RouteRecordRaw } from "vue-router";

export const routesAuth: RouteRecordRaw[] = [
  {
    path: "/",
    component: LayoutMain,
    meta: {
      guestOnly: true,
    },
    children: [
      {
        path: "login",
        name: "login",
        component: AuthPage,
        meta: {
          page: {
            base: {
              title: "Login",
            },
          },
        },
      },
    ],
  },
];
