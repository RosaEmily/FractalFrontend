import { routesSponsors } from "../modules/sponsors/router";
import { routesKpis } from "../modules/kpis/router";
import { routesFaqs } from "../modules/faqs/router";
import { routesSocialNetworks } from "../modules/social-networks/router";
import { routesBanners } from "../modules/banners/router";
import { routesContacts } from "../modules/contacts/router";

import type { RouteRecordRaw } from "vue-router";

export const routesContent: RouteRecordRaw[] = [
  {
    path: "content",
    name: "content",
    children: [
      ...routesSponsors,
      ...routesKpis,
      ...routesFaqs,
      ...routesSocialNetworks,
      ...routesBanners,
      ...routesContacts,
    ],
  },
];
