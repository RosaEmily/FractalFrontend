import ListPage from "../pages/list.vue";
import CreatePage from "../pages/create.vue";
import UpdatePage from "../pages/update.vue";

import type { RouteRecordRaw } from "vue-router";

const TitleBase = "Pagos | Métodos |";

export const routesPaymentMethods: RouteRecordRaw[] = [
  {
    path: "payment-methods",
    name: "paymentMethods",
    children: [
      {
        path: "",
        name: "paymentMethods.list",
        component: ListPage,
        meta: { page: { base: { title: `${TitleBase} Lista` } } },
      },
      {
        path: "create",
        name: "paymentMethods.create",
        component: CreatePage,
        meta: { page: { base: { title: `${TitleBase} Crear` } } },
      },
      {
        path: "edit/:id",
        name: "paymentMethods.update",
        component: UpdatePage,
        meta: { page: { base: { title: `${TitleBase} Actualizar` } } },
      },
    ],
  },
];
