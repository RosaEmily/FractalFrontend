import type { MenuItem } from "@/modules/admin/interface/nav-vertical";
import { mdiBriefcaseSearchOutline } from "@mdi/js";

/**
 * Ítem suelto, no un grupo: el diseño lo declara `single: true` porque un grupo
 * con un solo hijo obliga a un clic extra para llegar a la única pantalla.
 */
export const MENU_JOBS: MenuItem[] = [
  {
    id: "jobs.offers",
    label: "Bolsa de trabajo",
    icon: mdiBriefcaseSearchOutline,
    roles: ["ADMIN"],
    route: { name: "jobOffers.list" },
    module: "jobOffers",
  },
];
