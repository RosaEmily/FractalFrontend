const ListPage = () => import("../pages/list.vue");
const CreatePage = () => import("../pages/create.vue");
const EditPage = () => import("../pages/edit.vue");

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Contenido | FAQs |";

export const routesFaqs: RouteRecordRaw[] = [
  {
    path: "faqs",
    name: "faqs",
    children: [
      {
        path: "",
        name: "faqs.list",
        component: ListPage,
        meta: { page: { base: { title: `${TitleBase} Lista` } } },
      },
      {
        path: "create",
        name: "faqs.create",
        component: CreatePage,
        meta: { page: { base: { title: `${TitleBase} Crear` } } },
      },
      {
        path: "edit/:id",
        name: "faqs.edit",
        component: EditPage,
        meta: { page: { base: { title: `${TitleBase} Actualizar` } } },
      },
    ],
  },
];
