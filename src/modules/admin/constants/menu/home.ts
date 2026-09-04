import type { MenuItem } from "@/modules/admin/interface/nav-vertical";
import { mdiViewDashboardOutline } from "@mdi/js";

/** "Inicio" del diseño: ítem suelto, sin grupo, encabezando el menú. */
export const MENU_HOME: MenuItem[] = [
  {
    id: "home",
    label: "Inicio",
    icon: mdiViewDashboardOutline,
    roles: ["ADMIN", "COORDINATOR", "MANAGER"],
    route: { name: "admin-home" },
    module: "admin-home",
  },
];
