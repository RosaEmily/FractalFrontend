import { routesJobOffers } from "../modules/job-offers/router";

import type { RouteRecordRaw } from "vue-router";

export const routesJobs: RouteRecordRaw[] = [
  {
    path: "jobs",
    name: "jobs",
    children: [...routesJobOffers],
  },
];
