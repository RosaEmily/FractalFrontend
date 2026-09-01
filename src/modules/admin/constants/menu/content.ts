import type { MenuItem } from "@/modules/admin/interface/nav-vertical";
import {
  mdiShimmer,
  mdiBriefcaseOutline,
  mdiStarOutline,
  mdiEmailOutline,
  mdiWeb,
  mdiImageMultipleOutline,
  mdiCardAccountPhoneOutline,
} from "@mdi/js";

export const MENU_CONTENT: MenuItem[] = [
  {
    id: "content",
    label: "Sitio web",
    icon: mdiShimmer,
    roles: ["ADMIN"],
    children: [
      {
        id: "content.sponsors",
        label: "Patrocinadores",
        icon: mdiBriefcaseOutline,
        roles: ["ADMIN"],
        route: { name: "sponsors.list" },
        module: "sponsors",
      },
      {
        id: "content.kpis",
        label: "KPIs",
        icon: mdiStarOutline,
        roles: ["ADMIN"],
        route: { name: "kpis.list" },
        module: "kpis",
      },
      {
        id: "content.faqs",
        label: "FAQs",
        icon: mdiEmailOutline,
        roles: ["ADMIN"],
        route: { name: "faqs.list" },
        module: "faqs",
      },
      {
        id: "content.social",
        label: "Redes sociales",
        icon: mdiWeb,
        roles: ["ADMIN"],
        route: { name: "socialNetworks.list" },
        module: "socialNetworks",
      },
      {
        id: "content.contacts",
        label: "Contactos",
        icon: mdiCardAccountPhoneOutline,
        roles: ["ADMIN"],
        route: { name: "contacts.list" },
        module: "contacts",
      },
      {
        id: "content.banners",
        label: "Banners",
        icon: mdiImageMultipleOutline,
        roles: ["ADMIN"],
        route: { name: "banners.list" },
        module: "banners",
      },
    ],
  },
];
