import ListPage from "../pages/list.vue";

import type { RouteRecordRaw } from "vue-router";

/** Solo listado: la API expone únicamente index y show. */
export const routesTransactions: RouteRecordRaw[] = [
  {
    path: "transactions",
    name: "transactions",
    children: [
      {
        path: "",
        name: "transactions.list",
        component: ListPage,
        meta: { page: { base: { title: "Pagos | Transacciones" } } },
      },
    ],
  },
];
