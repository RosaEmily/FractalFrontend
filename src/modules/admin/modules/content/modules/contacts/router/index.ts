import ListPage from "../pages/list.vue";
import CreatePage from "../pages/create.vue";
import UpdatePage from "../pages/update.vue";

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
