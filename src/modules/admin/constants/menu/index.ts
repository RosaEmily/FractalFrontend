import type { MenuItem } from "@/modules/admin/interface/nav-vertical";
import { MENU_HOME } from "./home";
import { MENU_REPORTS } from "./reports";
import { MENU_CATALOG } from "./catalog";
import { MENU_SCHEDULING } from "./scheduling";
import { MENU_COMMERCIAL } from "./commercial";
import { MENU_EVALUATIONS } from "./evaluations";
import { MENU_CERTIFICATION } from "./certification";
import { MENU_PEOPLE } from "./people";
import { MENU_CONTENT } from "./content";
import { MENU_JOBS } from "./jobs";
import { MENU_SECURITY } from "./security";
import { MENU_SYSTEM } from "./system";

/**
 * El orden sigue el ciclo del negocio, como en el diseño (admin/shell.jsx):
 *   Catálogo → Programación → Matrículas → Evaluación → Certificación
 * y después los dominios de soporte (Personas, Sitio web, Empleos,
 * Seguridad, Sistema).
 */
export const MENU: MenuItem[] = [
  ...MENU_HOME,
  ...MENU_REPORTS,
  ...MENU_CATALOG,
  ...MENU_SCHEDULING,
  ...MENU_COMMERCIAL,
  ...MENU_EVALUATIONS,
  ...MENU_CERTIFICATION,
  ...MENU_PEOPLE,
  ...MENU_CONTENT,
  ...MENU_JOBS,
  ...MENU_SECURITY,
  ...MENU_SYSTEM,
];
