import type { RouteLocationRaw } from "vue-router";
import {
  mdiAccountGroupOutline,
  mdiBellOutline,
  mdiCalendarBlankOutline,
  mdiCertificateOutline,
  mdiChartBoxOutline,
  mdiFlagOutline,
  mdiTrayArrowUp,
} from "@mdi/js";
import type { NotificationDTO } from "../dto/classroom.dto";

/**
 * Icono por ORIGEN del aviso (cada `n.icon` del diseño, notify.jsx).
 *
 * ⚠️ Una campana para todo desperdicia la columna: el icono es lo primero que
 * se mira en una lista larga y debería decir de qué trata el aviso sin leerlo.
 *
 * Vive acá, junto al mapa de destinos, porque lo necesitan igual la campana y
 * la página completa.
 */
const ICONS: Record<string, string> = {
  class_sessions: mdiCalendarBlankOutline,
  session_materials: mdiTrayArrowUp,
  student_evaluations: mdiChartBoxOutline,
  course_evaluations: mdiFlagOutline,
  final_grades: mdiCertificateOutline,
  certificates: mdiCertificateOutline,
  offers: mdiAccountGroupOutline,
  enrollments: mdiChartBoxOutline,
};

export const notificationIcon = (notification: NotificationDTO): string =>
  ICONS[notification.entity_type] ?? mdiBellOutline;

/**
 * A dónde lleva cada aviso.
 *
 * ⚠️ El nombre que manda la API es el del DISEÑO (`sessions`, `grading`,
 * `evals`…), no el de la ruta del front, y varios significan pantallas
 * distintas según quién mire: `sessions` es la agenda del alumno y las
 * sesiones de clase del docente. Por eso el mapa es POR ROL.
 *
 * Vive acá y no en cada componente porque la campana y la página completa de
 * avisos lo necesitan igual: duplicarlo garantiza que un destino nuevo se
 * agregue en uno y se olvide en el otro.
 */
const STUDENT_ROUTES: Record<string, string> = {
  course: "classroom-course",
  certificates: "classroom-certificates",
  sessions: "classroom-agenda",
};

const TEACHER_ROUTES: Record<string, string> = {
  sessions: "classroom-teacher-sessions",
  grading: "classroom-teacher-grading",
  evals: "classroom-teacher-evaluations",
  finals: "classroom-teacher-finals",
  course: "classroom-teacher-courses",
};

const COORDINATOR_ROUTES: Record<string, string> = {
  cohorts: "classroom-coordinator-cohorts",
  programs: "classroom-coordinator-programs",
  reports: "classroom-coordinator-reports",
  certificates: "classroom-coordinator-reports",
};

/** Qué parámetro de PATH espera cada destino, cuando espera alguno. */
const ROUTE_PARAM: Record<string, string> = {
  "classroom-course": "id",
  "classroom-session": "sessionId",
};

export type NotificationAudience = "student" | "teacher" | "coordinator";

/**
 * Destino de un aviso, o `null` si ese rol no tiene dónde abrirlo.
 *
 * ⚠️ Hay DOS formas de llevar el id, según la pantalla:
 *
 * - El ALUMNO abre un recurso concreto, con `:param` en el path
 *   (`/cursos/12`).
 * - El DOCENTE no: sus pantallas son una sola vista con selector de curso, y
 *   se posicionan con `?course=` — el mismo contrato que usa "Mis cursos".
 *
 * Pasar el id por la vía equivocada no falla ruidosamente: queda colgado como
 * query que nadie lee, o deja la navegación en `/undefined`.
 */
export const notificationTarget = (
  notification: NotificationDTO,
  audience: NotificationAudience,
): RouteLocationRaw | null => {
  const table =
    audience === "student"
      ? STUDENT_ROUTES
      : audience === "teacher"
        ? TEACHER_ROUTES
        : COORDINATOR_ROUTES;

  const name = table[notification.route.name];

  if (!name) return null;

  const id = notification.route.id;

  if (!id) return { name };

  const param = ROUTE_PARAM[name];

  if (param) return { name, params: { [param]: id } };

  return audience === "teacher"
    ? { name, query: { course: String(id) } }
    : { name };
};
