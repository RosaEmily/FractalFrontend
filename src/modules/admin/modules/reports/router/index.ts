import type { RouteRecordRaw } from "vue-router";

/**
 * Reportes: solo listados de lectura, sin create ni update.
 *
 * Los nombres van con el prefijo `reports.` y sin colisionar por substring
 * con otros módulos: el menú resuelve el ítem activo con
 * `route.name.includes(item.module)`.
 */
export const routesReports: RouteRecordRaw[] = [
  {
    path: "reports/revenue",
    name: "reports.revenue",
    component: () => import("../pages/revenue.vue"),
    meta: { roles: ["ADMIN"], page: { base: { title: "Ingresos y cobranza" } } },
  },
  {
    path: "reports/enrollments",
    name: "reports.enrollments",
    component: () => import("../pages/enrollments.vue"),
    meta: {
      roles: ["ADMIN"],
      page: { base: { title: "Matrículas por programa" } },
    },
  },
  {
    path: "reports/occupancy",
    name: "reports.occupancy",
    component: () => import("../pages/occupancy.vue"),
    meta: {
      roles: ["ADMIN"],
      page: { base: { title: "Ocupación de cohortes" } },
    },
  },
  {
    path: "reports/academic",
    name: "reports.academic",
    component: () => import("../pages/academic.vue"),
    meta: {
      roles: ["ADMIN"],
      page: { base: { title: "Rendimiento académico" } },
    },
  },
  {
    path: "reports/certificates",
    name: "reports.certificates",
    component: () => import("../pages/certificates.vue"),
    meta: {
      roles: ["ADMIN"],
      page: { base: { title: "Certificados emitidos" } },
    },
  },
  {
    path: "reports/attendance",
    name: "reports.attendance",
    component: () => import("../pages/attendance.vue"),
    meta: { roles: ["ADMIN"], page: { base: { title: "Asistencia" } } },
  },
];
