import type { MenuItem } from "@/modules/admin/interface/nav-vertical";
import {
  mdiCalendarMonthOutline,
  mdiCalendarStarOutline,
  mdiPlayCircleOutline,
} from "@mdi/js";

/**
 * "Programación" del diseño: la cohorte concreta (cuándo y con quién).
 * Programas son las `offers` y Clases las `class_sessions`.
 */
export const MENU_SCHEDULING: MenuItem[] = [
  {
    id: "scheduling",
    label: "Programación",
    icon: mdiCalendarMonthOutline,
    roles: ["ADMIN"],
    children: [
      {
        id: "scheduling.offers",
        label: "Programas",
        icon: mdiCalendarStarOutline,
        roles: ["ADMIN"],
        route: { name: "offers.list" },
        module: "offers",
      },
      {
        id: "scheduling.classes",
        label: "Clases",
        icon: mdiPlayCircleOutline,
        roles: ["ADMIN"],
        route: { name: "classSessions.list" },
        module: "classSessions",
      },
    ],
  },
];
