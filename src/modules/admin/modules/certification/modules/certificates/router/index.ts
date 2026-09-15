import ListPage from "../pages/list.vue";
import CreatePage from "../pages/create.vue";
import UpdatePage from "../pages/update.vue";

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
