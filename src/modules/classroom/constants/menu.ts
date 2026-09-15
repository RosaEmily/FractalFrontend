import {
  mdiHomeOutline,
  mdiBookOpenPageVariantOutline,
  mdiSourceBranch,
  mdiCalendarBlankOutline,
  mdiCertificateOutline,
  mdiClipboardTextOutline,
  mdiChartBoxOutline,
  mdiViewGridOutline,
  mdiAccountGroupOutline,
} from "@mdi/js";

export interface ClassroomMenuItem {
  label: string;
  icon: string;
  /**
   * Nombre de la ruta destino, y también la clave con la que se resuelve el
   * ítem activo. Es una sola fuente de verdad: antes había además un `module`
   * con otra notación (`classroom.agenda` vs `classroom-agenda`) que nunca
   * llegaba a coincidir, así que ningún ítem se marcaba.
   */
  route: string;
  /**
   * Contador sobre el icono. Se resuelve en tiempo de render con datos de la
   * API, no acá: la constante solo declara qué ítem lo muestra.
   */
  badgeKey?: "attention" | "grading";
}

/**
 * El menú del aula cambia por completo según quién mira: no es el mismo menú
 * con ítems ocultos. Por eso es un mapa por rol y no una lista con `roles`.
 *
 * Un usuario con dos roles (raro, pero posible) ve el del primero que coincida
 * en este orden: la coordinación manda sobre el resto.
 */
export const CLASSROOM_MENU: Record<string, ClassroomMenuItem[]> = {
  STUDENT: [
    {
      label: "Inicio",
      icon: mdiHomeOutline,
      route: "classroom-home",
    },
    {
      label: "Línea de carrera",
      icon: mdiSourceBranch,
      route: "classroom-paths",
    },
    {
      label: "Cursos",
      icon: mdiBookOpenPageVariantOutline,
      route: "classroom-courses",
    },
    {
      label: "Cronograma",
      icon: mdiCalendarBlankOutline,
      route: "classroom-agenda",
    },
    {
      label: "Certificados",
      icon: mdiCertificateOutline,
      route: "classroom-certificates",
    },
  ],

  TEACHER: [
    {
      label: "Inicio",
      icon: mdiHomeOutline,
      route: "classroom-teacher-home",
    },
    {
      label: "Mis cursos",
      icon: mdiBookOpenPageVariantOutline,
      route: "classroom-teacher-courses",
    },
    {
      label: "Sesiones de clase",
      icon: mdiCalendarBlankOutline,
      route: "classroom-teacher-sessions",
    },
    {
      label: "Registro de notas",
      icon: mdiClipboardTextOutline,
      route: "classroom-teacher-grading",
      badgeKey: "grading",
    },
    {
      label: "Cuadro de evaluación",
      icon: mdiChartBoxOutline,
      route: "classroom-teacher-evaluations",
    },
    {
      label: "Actas y notas finales",
      icon: mdiCertificateOutline,
      route: "classroom-teacher-finals",
    },
  ],

  COORDINATOR: [
    {
      label: "Panel académico",
      icon: mdiHomeOutline,
      route: "classroom-coordinator-home",
      badgeKey: "attention",
    },
    {
      label: "Programas",
      icon: mdiSourceBranch,
      route: "classroom-coordinator-programs",
    },
    {
      label: "Cohortes",
      icon: mdiViewGridOutline,
      route: "classroom-coordinator-cohorts",
    },
    {
      label: "Docentes",
      icon: mdiAccountGroupOutline,
      route: "classroom-coordinator-teachers",
    },
    {
      label: "Cierres y pagos",
      icon: mdiChartBoxOutline,
      route: "classroom-coordinator-reports",
    },
  ],
};

/** Orden de precedencia cuando el usuario tiene más de un rol del aula. */
export const CLASSROOM_ROLE_PRIORITY = ["COORDINATOR", "TEACHER", "STUDENT"];

/**
 * Pantallas alcanzables fuera del menú (detalle o menú de usuario). El valor es
 * la ruta del ítem que queda marcado mientras se está ahí: un detalle no tiene
 * entrada propia, pero el usuario sigue "dentro" de su sección.
 */
export const CLASSROOM_PARENT: Record<string, string> = {
  "classroom-course": "classroom-courses",
  "classroom-path": "classroom-paths",
  "classroom-session": "classroom-agenda",
  "classroom-enrollment": "classroom-account",
};
