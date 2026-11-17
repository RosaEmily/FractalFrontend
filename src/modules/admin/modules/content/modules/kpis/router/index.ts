const ListPage = () => import("../pages/list.vue");
const CreatePage = () => import("../pages/create.vue");
const EditPage = () => import("../pages/edit.vue");

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Contenido | KPIs |";

export const routesKpis: RouteRecordRaw[] = [
  {
    path: "kpis",
    name: "kpis",
    children: [
      {
        path: "",
        name: "kpis.list",
        component: ListPage,
        meta: { page: { base: { title: `${TitleBase} Lista` } } },
      },
      {
        path: "create",
        name: "kpis.create",
        component: CreatePage,
        meta: { page: { base: { title: `${TitleBase} Crear` } } },
      },
      {
        path: "edit/:id",
        name: "kpis.edit",
        component: EditPage,
        meta: { page: { base: { title: `${TitleBase} Actualizar` } } },
      },
    ],
  },
];
