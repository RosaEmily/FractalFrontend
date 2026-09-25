/**
 * Etiquetas del aula. Se nombran por lo que significan para el usuario, no por
 * el valor técnico que guarda la BD: nadie debería leer "STUDENT" ni "locked"
 * en pantalla.
 */

import { mdiBriefcaseOutline, mdiSchoolOutline, mdiShimmer } from "@mdi/js";

/**
 * Bloque de soporte al pie del sidebar. Da salida cuando algo no cuadra con la
 * plataforma o la matrícula, que es lo que el alumno no puede resolver solo.
 */
export const CLASSROOM_SUPPORT = {
  eyebrow: "Soporte",
  question: "¿Dudas con la plataforma o tu matrícula?",
  action: "Escribir a soporte",
  href: "https://wa.me/51999999999",
};

/** Rol del aula, tal como se muestra en el menú de usuario. */
export const CLASSROOM_ROLE_LABEL: Record<string, string> = {
  STUDENT: "Estudiante",
  TEACHER: "Docente",
  COORDINATOR: "Coordinación académica",
};

/**
 * Qué hace cada rol, para que quien tiene varios sepa cuál elegir. Los textos
 * son los del diseño (`aula/login.jsx` → `AULA_ROLES.desc`): describen lo que
 * la persona va a ver, no el permiso técnico.
 */
export const CLASSROOM_ROLE_DESC: Record<string, string> = {
  STUDENT: "Mis cursos, clases, notas y certificados",
  TEACHER: "Sesiones, asistencia y registro de notas",
  COORDINATOR: "Cohortes, cupos y cierres pendientes",
};

/** Icono con el que se ofrece cada rol al elegir vista. */
export const CLASSROOM_ROLE_ICON: Record<string, string> = {
  STUDENT: mdiSchoolOutline,
  TEACHER: mdiBriefcaseOutline,
  COORDINATOR: mdiShimmer,
};

/**
 * `students.career` — la BD guarda la clave técnica (`civil_engineering`) y en
 * pantalla tiene que leerse en español, no el identificador crudo.
 */
export const CAREER_LABEL: Record<string, string> = {
  civil_engineering: "Ingeniería civil",
  architecture: "Arquitectura",
  interior_design: "Diseño de interiores",
  other: "Otra",
};

/** `enrollment_courses.progress_status`. */
export const PROGRESS_LABEL: Record<string, string> = {
  locked: "Bloqueado",
  in_progress: "En curso",
  completed: "Completado",
};

export const PROGRESS_TONE: Record<string, string> = {
  locked: "neutral",
  in_progress: "accent",
  completed: "success",
};

/**
 * Estado del curso que calcula el backend (`ClassroomService::studentCourseState`).
 * Es más rico que `progress_status`: distingue el acta pendiente del curso
 * cerrado y el certificado emitido.
 */
export const COURSE_STATE_LABEL: Record<string, string> = {
  locked: "Bloqueado",
  in_progress: "En curso",
  completed: "Completado",
  pending_final: "Nota final pendiente",
  approved: "Aprobado",
  failed: "Desaprobado",
  certified: "Certificado emitido",
};

export const COURSE_STATE_TONE: Record<string, string> = {
  locked: "neutral",
  in_progress: "accent",
  completed: "neutral",
  pending_final: "warning",
  approved: "success",
  failed: "danger",
  certified: "success",
};

/** `attendances.attended` — se persiste 0/1/2, no se deriva de `join_time`. */
export const ATTENDANCE_LABEL: Record<number, string> = {
  0: "Ausente",
  1: "Presente",
  2: "Tardanza",
};

export const ATTENDANCE_TONE: Record<number, string> = {
  0: "danger",
  1: "success",
  2: "warning",
};

/** `enrollments.payment_status`. */
export const PAYMENT_LABEL: Record<string, string> = {
  pending: "Pago pendiente",
  paid: "Pagado",
  failed: "Pago rechazado",
  cancelled: "Anulada",
};

export const PAYMENT_TONE: Record<string, string> = {
  pending: "warning",
  paid: "success",
  failed: "danger",
  cancelled: "neutral",
};

/** `class_sessions.status` — 0 pendiente, 1 dictada. La cierra el docente. */
export const SESSION_STATUS_LABEL: Record<number, string> = {
  0: "Pendiente",
  1: "Dictada",
};

/** Días de `schedules.day_of_week`, en el orden de la semana. */
export const WEEKDAY_LABEL: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export const WEEKDAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/** Tipos de `session_materials.type` y su etiqueta legible. */
export const MATERIAL_LABEL: Record<string, string> = {
  pdf: "PDF",
  docx: "Word",
  pptx: "Diapositivas",
  xlsx: "Excel",
  rvt: "Revit",
  dwg: "AutoCAD",
  zip: "ZIP",
};
