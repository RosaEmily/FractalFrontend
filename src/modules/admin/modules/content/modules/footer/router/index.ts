import IndexPage from "../pages/index.vue";

import type { RouteRecordRaw } from "vue-router";

export const routesFooter: RouteRecordRaw[] = [
  {
    path: "footer",
    name: "footer",
    component: IndexPage,
    meta: { page: { base: { title: "Contenido | Pie de página | Editar" } } },
  },
];
