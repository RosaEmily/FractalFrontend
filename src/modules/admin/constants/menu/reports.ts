import type { MenuItem } from "@/modules/admin/interface/nav-vertical";
import {
  mdiChartBoxOutline,
  mdiCashMultiple,
  mdiClipboardTextOutline,
  mdiAccountGroupOutline,
  mdiSchoolOutline,
  mdiCertificateOutline,
  mdiCheckboxMarkedCircleOutline,
  mdiViewDashboardOutline,
  mdiClockAlertOutline,
  mdiMessageAlertOutline,
  mdiAccountMinusOutline,
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
    children: [
      {
        id: "reports.executive",
        label: "Resumen ejecutivo",
        icon: mdiViewDashboardOutline,
        route: { name: "reports.executive" },
        module: "reports.executive",
      },
      {
        id: "reports.revenue",
        label: "Ingresos y cobranza",
        icon: mdiCashMultiple,
        route: { name: "reports.revenue" },
        module: "reports.revenue",
      },
      {
        id: "reports.enrollments",
        label: "Matrículas por programa",
        icon: mdiClipboardTextOutline,
        route: { name: "reports.enrollments" },
        module: "reports.enrollments",
      },
      {
        id: "reports.occupancy",
        label: "Ocupación de cohortes",
        icon: mdiAccountGroupOutline,
        route: { name: "reports.occupancy" },
        module: "reports.occupancy",
      },
      {
        id: "reports.academic",
        label: "Rendimiento académico",
        icon: mdiSchoolOutline,
        route: { name: "reports.academic" },
        module: "reports.academic",
      },
      {
        id: "reports.certificates",
        label: "Certificados emitidos",
        icon: mdiCertificateOutline,
        route: { name: "reports.certificates" },
        module: "reports.certificates",
      },
      {
        id: "reports.attendance",
        label: "Asistencia",
        icon: mdiCheckboxMarkedCircleOutline,
        route: { name: "reports.attendance" },
        module: "reports.attendance",
      },
      {
        id: "reports.aging",
        label: "Antigüedad de cobranza",
        icon: mdiClockAlertOutline,
        route: { name: "reports.aging" },
        module: "reports.aging",
      },
      {
        id: "reports.retention",
        label: "Retención por cohorte",
        icon: mdiAccountMinusOutline,
        route: { name: "reports.retention" },
        module: "reports.retention",
      },
      {
        id: "reports.complaints",
        label: "Reclamos por vencer",
        icon: mdiMessageAlertOutline,
        route: { name: "reports.complaints" },
        module: "reports.complaints",
      },
    ],
  },
];
