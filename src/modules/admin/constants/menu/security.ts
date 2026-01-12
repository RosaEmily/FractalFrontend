import type { MenuItem } from "@/modules/admin/interface/nav-vertical";
import { mdiCog, mdiMapMarkerOutline, mdiTicket } from "@mdi/js";

export const MENU_SECURITY: MenuItem[] = [
  {
    id: "security",
    label: "Seguridad",
    icon: mdiCog,
    roles: ["ADMIN"],
    children: [
      {
        id: "security.permissions",
        label: "Permisos",
        icon: mdiMapMarkerOutline,
        roles: ["ADMIN"],
        route: {
          name: "permission.list",
        },
      },
      {
        id: "security.roles",
        label: "Roles",
        icon: mdiTicket,
        roles: ["ADMIN"],
        route: {
          name: "role.list",
        },
      },
    ],
  },
];
