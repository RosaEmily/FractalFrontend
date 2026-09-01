import ProfilePage from "../pages/index.vue";

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Mi perfil";

export const routesProfile: RouteRecordRaw[] = [
  {
    path: "profile",
    name: "profile",
    children: [
      {
        path: "",
        name: "profile.show",
        component: ProfilePage,
        meta: {
          page: {
            base: {
              title: TitleBase,
            },
          },
        },
      },
    ],
  },
];
