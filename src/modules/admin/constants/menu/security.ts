import type { MenuItem } from "@/modules/admin/interface/nav-vertical";
import { mdiCog, mdiShieldKeyOutline, mdiAccountKeyOutline } from "@mdi/js";

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
        icon: mdiShieldKeyOutline,
        roles: ["ADMIN"],
        route: {
          name: "permissions.list",
        },
        module: "permissions",
      },
      {
        id: "security.roles",
        label: "Roles",
        icon: mdiAccountKeyOutline,
        roles: ["ADMIN"],
        route: {
          name: "roles.list",
        },
        module: "roles",
      },
    ],
  },
];
