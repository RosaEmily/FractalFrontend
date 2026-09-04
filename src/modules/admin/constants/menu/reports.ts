import type { MenuItem } from "@/modules/admin/interface/nav-vertical";
import {
  mdiChartBoxOutline,
  mdiCashMultiple,
  mdiClipboardTextOutline,
  mdiAccountGroupOutline,
  mdiSchoolOutline,
  mdiCertificateOutline,
  mdiCheckboxMarkedCircleOutline,
} from "@mdi/js";

/**
 * "Reportes" del diseño: solo lectura, encabezando el menú después de Inicio.
 *
 * ⚠️ Los `module` llevan el prefijo `reports.` completo. El nav resuelve el
 * ítem activo con `route.name.includes(item.module)`, así que un `module`
 * de "certificates" o "enrollments" se activaría también estando en el
 * reporte homónimo, marcando dos ítems a la vez.
 */
export const MENU_REPORTS: MenuItem[] = [
  {
    id: "reports",
    label: "Reportes",
    icon: mdiChartBoxOutline,
    roles: ["ADMIN"],
    children: [
      {
        id: "reports.revenue",
        label: "Ingresos y cobranza",
        icon: mdiCashMultiple,
        roles: ["ADMIN"],
        route: { name: "reports.revenue" },
        module: "reports.revenue",
      },
      {
        id: "reports.enrollments",
        label: "Matrículas por programa",
        icon: mdiClipboardTextOutline,
        roles: ["ADMIN"],
        route: { name: "reports.enrollments" },
        module: "reports.enrollments",
      },
      {
        id: "reports.occupancy",
        label: "Ocupación de cohortes",
        icon: mdiAccountGroupOutline,
        roles: ["ADMIN"],
        route: { name: "reports.occupancy" },
        module: "reports.occupancy",
      },
      {
        id: "reports.academic",
        label: "Rendimiento académico",
        icon: mdiSchoolOutline,
        roles: ["ADMIN"],
        route: { name: "reports.academic" },
        module: "reports.academic",
      },
      {
        id: "reports.certificates",
        label: "Certificados emitidos",
        icon: mdiCertificateOutline,
        roles: ["ADMIN"],
        route: { name: "reports.certificates" },
        module: "reports.certificates",
      },
      {
        id: "reports.attendance",
        label: "Asistencia",
        icon: mdiCheckboxMarkedCircleOutline,
        roles: ["ADMIN"],
        route: { name: "reports.attendance" },
        module: "reports.attendance",
      },
    ],
  },
];
