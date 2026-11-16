import { routesCertificateTemplates } from "../modules/templates/router";
import { routesCertificates } from "../modules/certificates/router";
import { routesTestimonials } from "../modules/testimonials/router";

import type { RouteRecordRaw } from "vue-router";

export const routesCertification: RouteRecordRaw[] = [
  {
    path: "certification",
    name: "certification",
    children: [
      ...routesCertificateTemplates,
      ...routesCertificates,
      ...routesTestimonials,
    ],
  },
];
