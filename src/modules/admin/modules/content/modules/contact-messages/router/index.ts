const ListPage = () => import("../pages/list.vue");

import type { RouteRecordRaw } from "vue-router";

export const routesContactMessages: RouteRecordRaw[] = [
  {
    path: "contact-messages",
    name: "contactMessages",
    children: [
      {
        path: "",
        name: "contactMessages.list",
        component: ListPage,
        meta: { page: { base: { title: "Contenido | Mensajes de contacto | Lista" } } },
      },
    ],
  },
];
