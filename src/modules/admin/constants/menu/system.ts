import type { MenuItem } from "@/modules/admin/interface/nav-vertical";
import {
  mdiCogOutline,
  mdiTextBoxSearchOutline,
  mdiCurrencyUsd,
} from "@mdi/js";

/**
 * "Sistema" del diseño: configuración transversal y bitácora.
 * Monedas vive aquí (no en Catálogo) porque es configuración, no producto.
 * Las sesiones activas pasaron a "Seguridad", junto a usuarios y roles.
 */
export const MENU_SYSTEM: MenuItem[] = [
  {
    id: "system",
    label: "Sistema",
    icon: mdiCogOutline,
    children: [
      {
        id: "system.currencies",
        label: "Monedas",
        icon: mdiCurrencyUsd,
        route: { name: "currencies.list" },
        module: "currencies",
      },
      {
        id: "system.logs",
        label: "Logs",
        icon: mdiTextBoxSearchOutline,
        route: { name: "logs.list" },
        module: "logs",
      },
    ],
  },
];
