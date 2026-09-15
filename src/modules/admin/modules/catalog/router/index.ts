import type { RouteRecordRaw } from "vue-router";
import { routesOffers } from "../modules/offers/router";
import { routesLearningPaths } from "../modules/learning-paths/router";
import { routesCourses } from "../modules/courses/router";
import { routesCurrencies } from "../modules/currencies/router";
import { routesTags } from "../modules/tags/router";

export const routesCatalog: RouteRecordRaw[] = [
  {
    path: "catalog",
    name: "catalog",
    children: [...routesOffers, ...routesLearningPaths, ...routesCourses, ...routesTags, ...routesCurrencies],
  },
];
