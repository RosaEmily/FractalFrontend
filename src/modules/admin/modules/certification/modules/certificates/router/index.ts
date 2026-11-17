const ListPage = () => import("../pages/list.vue");
const CreatePage = () => import("../pages/create.vue");
const UpdatePage = () => import("../pages/update.vue");

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Certificación | Certificados |";

export const routesCertificates: RouteRecordRaw[] = [
  {
    path: "certificates",
    name: "certificates",
    children: [
      {
        path: "",
        name: "certificates.list",
        component: ListPage,
        meta: { page: { base: { title: `${TitleBase} Lista` } } },
      },
      {
        path: "create",
        name: "certificates.create",
        component: CreatePage,
        meta: { page: { base: { title: `${TitleBase} Emitir` } } },
      },
      {
        path: "edit/:id",
        name: "certificates.update",
        component: UpdatePage,
        meta: { page: { base: { title: `${TitleBase} Actualizar` } } },
      },
    ],
  },
];
