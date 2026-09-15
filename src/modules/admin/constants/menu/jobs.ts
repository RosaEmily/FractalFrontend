import type { MenuItem } from "@/modules/admin/interface/nav-vertical";
import { mdiEarth, mdiBriefcaseSearchOutline } from "@mdi/js";

export const MENU_JOBS: MenuItem[] = [
  {
    id: "jobs",
    label: "Empleos",
    icon: mdiEarth,
    roles: ["ADMIN"],
    children: [
      {
        id: "jobs.offers",
        label: "Bolsa de trabajo",
        icon: mdiBriefcaseSearchOutline,
        roles: ["ADMIN"],
        route: { name: "jobOffers.list" },
        module: "jobOffers",
      },
    ],
  },
];
