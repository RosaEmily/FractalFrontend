import type { MenuItem } from "@/modules/admin/interface/nav-vertical";
import {
  mdiBriefcaseOutline,
  mdiClipboardTextOutline,
  mdiCreditCardOutline,
  mdiSwapHorizontal,
} from "@mdi/js";

/**
 * "Matrículas y pagos" del diseño: agrupa el lado comercial del ciclo.
 * Reemplaza al grupo "Pagos" suelto y saca Matrículas de "Académico".
 */
export const MENU_COMMERCIAL: MenuItem[] = [
  {
    id: "commercial",
    label: "Matrículas y pagos",
    icon: mdiBriefcaseOutline,
    children: [
      {
        id: "commercial.enrollments",
        label: "Matrículas",
        icon: mdiClipboardTextOutline,
        route: { name: "enrollments.list" },
        module: "enrollments",
      },
      {
        id: "commercial.paymentMethods",
        label: "Métodos de pago",
        icon: mdiCreditCardOutline,
        route: { name: "paymentMethods.list" },
        module: "paymentMethods",
      },
      {
        id: "commercial.transactions",
        label: "Transacciones",
        icon: mdiSwapHorizontal,
        route: { name: "transactions.list" },
        module: "transactions",
      },
    ],
  },
];
