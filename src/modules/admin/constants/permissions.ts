import type { RouteLocationRaw, RouteRecordRaw } from "vue-router";
import { hasPermission } from "@/shared/utils/permissions";
import type { MenuItem } from "../interface/nav-vertical";

/**
 * Qué permiso exige cada pantalla del panel.
 *
 * Los nombres son un ESPEJO del catálogo del backend (`Permissions` y
 * `PermissionModules` en `app/Shared/Constant`): `RECURSO_ACCION`. Si el
 * backend agrega o renombra un recurso, se actualiza aquí — un nombre que no
 * exista deja la pantalla cerrada a todos menos al ADMIN, nunca abierta.
 *
 * ⚠️ Es UX. Un usuario que se salte este guard solo consigue ver una pantalla
 * vacía: la API autoriza cada petición por su cuenta.
 */

/** Primer segmento del nombre de la ruta → recurso del backend. */
const RESOURCE_BY_ROUTE: Record<string, string> = {
  banners: "BANNERS",
  certificates: "CERTIFICATES",
  certificateTemplates: "CERTIFICATE_TEMPLATES",
  classSessions: "CLASS_SESSIONS",
  complaints: "COMPLAINTS",
  contactMessages: "CONTACT_MESSAGES",
  contacts: "CONTACTS",
  courseEvaluations: "COURSE_EVALUATIONS",
  courses: "COURSES",
  currencies: "CURRENCIES",
  enrollments: "ENROLLMENTS",
  evaluationTypes: "EVALUATION_TYPES",
  faqs: "FAQS",
  finalGrades: "FINAL_GRADES",
  footer: "FOOTER",
  jobOffers: "JOB_OFFERS",
  kpis: "KPIS",
  learningPaths: "LEARNING_PATHS",
  logs: "LOGS",
  offers: "OFFERS",
  pages: "PAGES",
  paymentMethods: "PAYMENT_METHODS",
  permissions: "PERMISSIONS",
  roles: "ROLES",
  siteConfig: "SITE_CONFIG",
  socialNetworks: "SOCIAL_NETWORKS",
  sponsors: "SPONSORS",
  studentEvaluations: "STUDENT_EVALUATIONS",
  students: "STUDENTS",
  systemSessions: "SESSIONS",
  tags: "TAGS",
  teachers: "TEACHERS",
  testimonials: "TESTIMONIALS",
  transactions: "TRANSACTIONS",
  users: "USERS",
};

/** Último segmento del nombre de la ruta → acción. Sin sufijo = ver. */
const ACTION_BY_SUFFIX: Record<string, string> = {
  list: "VIEW",
  create: "CREATE",
  edit: "UPDATE",
  update: "UPDATE",
};

/** Pantallas con un permiso propio que no sigue la regla `recurso.acción`. */
const EXACT: Record<string, string> = {
  "admin-home": "DASHBOARD_VIEW",
  "students.import": "PEOPLE_IMPORTS_CREATE",
  "teachers.import": "PEOPLE_IMPORTS_CREATE",
  "offers.sessions": "OFFERS_VIEW",
  "offers.sessions.manage": "OFFERS_UPDATE",
};

/** Pantallas que cualquier usuario del panel puede abrir: su propia cuenta. */
export const OPEN_PANEL_ROUTES: readonly string[] = ["profile.show"];

/**
 * Permiso que exige una pantalla, o `undefined` si el nombre no corresponde a
 * ningún recurso conocido (y entonces el guard la cierra).
 */
export const permissionForRoute = (name: unknown): string | undefined => {
  if (typeof name !== "string") return undefined;
  if (EXACT[name]) return EXACT[name];

  const [first, ...rest] = name.split(".");

  // Reportes: `reports.revenue` → REPORTS_REVENUE_VIEW.
  if (first === "reports" && rest.length === 1) {
    return `REPORTS_${rest[0].toUpperCase()}_VIEW`;
  }

  const resource = RESOURCE_BY_ROUTE[first];
  if (!resource) return undefined;

  const action = rest.length ? ACTION_BY_SUFFIX[rest[rest.length - 1]] : "VIEW";

  return action ? `${resource}_${action}` : undefined;
};

/**
 * Recurso de la pantalla actual (`roles.list` → `ROLES`). Sirve para decidir
 * los botones de un listado: crear, editar, cambiar estado y eliminar.
 */
export const resourceForRoute = (name: unknown): string | undefined =>
  typeof name === "string" ? RESOURCE_BY_ROUTE[name.split(".")[0]] : undefined;

/**
 * Asigna `meta.permission` a cada pantalla del árbol según su nombre. No pisa
 * un permiso que la ruta ya declare. Las pantallas sin nombre mapeado quedan sin
 * permiso y el guard las trata como cerradas.
 */
export const withPermissions = (route: RouteRecordRaw): RouteRecordRaw => {
  const children = route.children?.map(withPermissions);
  const isScreen = Boolean(route.component) && !route.children?.length;
  const next = (children ? { ...route, children } : { ...route }) as RouteRecordRaw;

  if (!isScreen || next.meta?.permission) return next;

  const name = typeof route.name === "string" ? route.name : "";

  if (OPEN_PANEL_ROUTES.includes(name)) {
    return { ...next, meta: { ...next.meta, anyPanelUser: true } } as RouteRecordRaw;
  }

  const permission = permissionForRoute(route.name);

  return permission
    ? ({ ...next, meta: { ...next.meta, permission } } as RouteRecordRaw)
    : next;
};

/**
 * ¿Aparece este ítem del menú? Sale del permiso de su ruta: un ítem sin ruta
 * (un grupo) aparece si algún hijo aparece, y una ruta sin permiso conocido no
 * aparece — el menú no ofrece lo que el guard cerraría.
 */
const itemRouteName = (item: MenuItem): unknown =>
  typeof item.route === "object" && item.route !== null && "name" in item.route
    ? (item.route as { name?: unknown }).name
    : undefined;

export const filterMenuByPermissions = (
  items: MenuItem[],
  granted: readonly string[],
): MenuItem[] =>
  items.reduce<MenuItem[]>((acc, item) => {
    if (item.children?.length) {
      const children = filterMenuByPermissions(item.children, granted);
      if (children.length) acc.push({ ...item, children });
      return acc;
    }

    const permission = permissionForRoute(itemRouteName(item));
    if (permission && hasPermission(granted, permission)) acc.push(item);

    return acc;
  }, []);

/**
 * Primera pantalla del menú a la que el usuario puede entrar. Sirve para
 * mandarlo a algo útil cuando no tiene permiso de «Inicio» en vez de dejarlo en
 * un 403 al iniciar sesión.
 */
export const firstAccessibleRoute = (
  items: MenuItem[],
  granted: readonly string[],
): RouteLocationRaw | undefined => {
  for (const item of filterMenuByPermissions(items, granted)) {
    const leaf = item.children?.length ? firstAccessibleRoute(item.children, granted) : item.route;
    if (leaf) return leaf;
  }

  return undefined;
};
