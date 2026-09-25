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
 * Un usuario con varios roles ve el del rol ACTIVO, que él elige al entrar y
 * puede cambiar desde el menú de usuario ("CAMBIAR DE VISTA"). No es raro:
 * alguien puede llevar un curso, dictar otro y además coordinar.
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
      label: "Grupos",
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

/**
 * Orden en que se ofrecen los roles del aula, y respaldo para quien todavía no
 * eligió (un rol único no se pregunta). El activo lo decide el usuario:
 * ver `useClassroomRole`.
 */
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

/**
 * Pantalla de entrada de cada rol del aula.
 *
 * ⚠️ `classroom-home` es SOLO del alumno (`meta.roles: ["STUDENT"]`). Mandar
 * ahí a un docente lo devolvía al login: el login validaba bien su rol y
 * guardaba el perfil, pero el guard de la home lo rechazaba por rol y —como un
 * rol ajeno a la zona no es un 403 sino una sesión que no sirve— borraba la
 * cookie de perfil recién escrita. El toast decía "sesión iniciada" y la
 * pantalla siguiente era otra vez el login.
 */
export const CLASSROOM_ROLE_HOME: Record<string, string> = {
  COORDINATOR: "classroom-coordinator-home",
  TEACHER: "classroom-teacher-home",
  STUDENT: "classroom-home",
};

/**
 * A qué pantalla entra este usuario: la home de `preferred` si es un rol que
 * tiene, y si no la del de mayor precedencia.
 *
 * Sin rol conocido cae a la home del alumno: el guard decidirá, y esa ruta es
 * la única que existía antes.
 */
export const classroomHomeFor = (
  roles: string[],
  preferred?: string | null,
): string => {
  /*
   * El rol ELEGIDO manda sobre la precedencia: un alumno-docente que entró como
   * docente tiene que caer en su panel, no en el del alumno por ser el de mayor
   * prioridad. La precedencia solo decide cuando todavía no eligió.
   */
  const role =
    preferred && roles.includes(preferred)
      ? preferred
      : CLASSROOM_ROLE_PRIORITY.find((name) => roles.includes(name));

  return (role && CLASSROOM_ROLE_HOME[role]) ?? "classroom-home";
};

/** A qué rol pertenece cada home, para leer la elección desde una ruta. */
export const CLASSROOM_HOME_ROLE: Record<string, string> = Object.fromEntries(
  Object.entries(CLASSROOM_ROLE_HOME).map(([role, route]) => [route, role]),
);
