import ListPage from "../pages/list.vue";
import CreatePage from "../pages/create.vue";
import UpdatePage from "../pages/update.vue";

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Certificación | Testimonios |";

export const routesTestimonials: RouteRecordRaw[] = [
  {
    path: "testimonials",
    name: "testimonials",
    children: [
      {
        path: "",
        name: "testimonials.list",
        component: ListPage,
        meta: { page: { base: { title: `${TitleBase} Lista` } } },
      },
      {
        path: "create",
        name: "testimonials.create",
        component: CreatePage,
        meta: { page: { base: { title: `${TitleBase} Crear` } } },
      },
      {
        path: "edit/:id",
        name: "testimonials.update",
        component: UpdatePage,
        meta: { page: { base: { title: `${TitleBase} Actualizar` } } },
      },
    ],
  },
];
