const ListPage = () => import("../pages/list.vue");
const CreatePage = () => import("../pages/create.vue");
const UpdatePage = () => import("../pages/update.vue");

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Contenido | Contactos |";

export const routesContacts: RouteRecordRaw[] = [
  {
    path: "contacts",
    name: "contacts",
    children: [
      {
        path: "",
        name: "contacts.list",
        component: ListPage,
        meta: { page: { base: { title: `${TitleBase} Lista` } } },
      },
      {
        path: "create",
        name: "contacts.create",
        component: CreatePage,
        meta: { page: { base: { title: `${TitleBase} Crear` } } },
      },
      {
        path: "edit/:id",
        name: "contacts.update",
        component: UpdatePage,
        meta: { page: { base: { title: `${TitleBase} Actualizar` } } },
      },
    ],
  },
];
