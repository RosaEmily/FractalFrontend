import type { MenuItem } from "@/modules/admin/interface/nav-vertical";
import {
  mdiShieldAccountOutline,
  mdiShieldKeyOutline,
  mdiAccountKeyOutline,
  mdiAccountMultipleOutline,
  mdiCellphoneLink,
} from "@mdi/js";

/**
 * Orden del diseño: usuarios → roles → permisos → sesiones activas.
 * Las sesiones se listan aquí (y no en Sistema) porque son control de acceso.
 */
export const MENU_SECURITY: MenuItem[] = [
  {
    id: "security",
    label: "Seguridad",
    icon: mdiShieldAccountOutline,
    roles: ["ADMIN"],
    children: [
      {
        id: "security.users",
        label: "Usuarios",
        icon: mdiAccountMultipleOutline,
        roles: ["ADMIN"],
        route: { name: "users.list" },
        module: "users",
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
        id: "security.sessions",
        label: "Sesiones activas",
        icon: mdiCellphoneLink,
        roles: ["ADMIN"],
        route: { name: "systemSessions.list" },
        module: "systemSessions",
      },
    ],
  },
];
