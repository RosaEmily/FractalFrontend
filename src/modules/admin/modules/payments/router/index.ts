import { routesPaymentMethods } from "../modules/payment-methods/router";
import { routesTransactions } from "../modules/transactions/router";

import type { RouteRecordRaw } from "vue-router";

export const routesPayments: RouteRecordRaw[] = [
  {
    path: "payments",
    name: "payments",
    children: [...routesPaymentMethods, ...routesTransactions],
  },
];
