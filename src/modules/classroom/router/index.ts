import type { RouteRecordRaw } from "vue-router";
import LayoutClassroom from "../layouts/main.vue";

/*
 * Aula virtual: tres zonas bajo un mismo shell.
 *
 * Cada zona lleva su `meta.roles` real, no decorativo: el guard del router ya
 * lee los roles de la cookie de usuario (antes caía a ["ADMIN"] y no protegía
 * nada). La API vuelve a validar por su cuenta — esto solo evita que alguien
 * llegue a una pantalla donde todo respondería 403.
 *
 * Los nombres de ruta siguen el prefijo del menú (`classroom.courses` marca
 * `classroom.courses.detail`), así el ítem activo se resuelve por segmento.
 */
export const routesClassroom: RouteRecordRaw[] = [
  {
    path: "/aula",
    component: LayoutClassroom,
    meta: { auth: true },
    children: [
      // ─── Alumno ───────────────────────────────────────────────────────
      {
        path: "",
        name: "classroom-home",
        component: () => import("../pages/student/home.vue"),
        meta: {
          roles: ["STUDENT"],
          page: { base: { title: "Inicio · Aula virtual" } },
        },
      },
      {
        path: "cursos",
        name: "classroom-courses",
        component: () => import("../pages/student/courses.vue"),
        meta: {
          roles: ["STUDENT"],
          page: { base: { title: "Mis cursos" } },
        },
      },
      {
        path: "cursos/:id",
        name: "classroom-course",
        component: () => import("../pages/student/course-detail.vue"),
        props: true,
        meta: {
          roles: ["STUDENT"],
          page: { base: { title: "Curso" } },
        },
      },
      {
        path: "lineas-de-carrera",
        name: "classroom-paths",
        component: () => import("../pages/student/paths.vue"),
        meta: {
          roles: ["STUDENT"],
          page: { base: { title: "Líneas de carrera" } },
        },
      },
      {
        path: "lineas-de-carrera/:offerId",
        name: "classroom-path",
        component: () => import("../pages/student/path-detail.vue"),
        props: true,
        meta: {
          roles: ["STUDENT"],
          page: { base: { title: "Línea de carrera" } },
        },
      },
      {
        path: "cronograma",
        name: "classroom-agenda",
        component: () => import("../pages/student/agenda.vue"),
        meta: {
          roles: ["STUDENT"],
          page: { base: { title: "Cronograma" } },
        },
      },
      {
        path: "clases/:sessionId",
        name: "classroom-session",
        component: () => import("../pages/student/session-detail.vue"),
        props: true,
        meta: {
          roles: ["STUDENT"],
          page: { base: { title: "Sesión de clase" } },
        },
      },
      {
        path: "certificados",
        name: "classroom-certificates",
        component: () => import("../pages/student/certificates.vue"),
        meta: {
          roles: ["STUDENT"],
          page: { base: { title: "Certificados" } },
        },
      },
      {
        path: "mi-cuenta",
        name: "classroom-account",
        component: () => import("../pages/student/account.vue"),
        meta: {
          roles: ["STUDENT"],
          page: { base: { title: "Mi cuenta" } },
        },
      },
      {
        path: "matriculas/:enrollmentId",
        name: "classroom-enrollment",
        component: () => import("../pages/student/enrollment-detail.vue"),
        props: true,
        meta: {
          roles: ["STUDENT"],
          page: { base: { title: "Detalle de matrícula" } },
        },
      },

      // ─── Docente ──────────────────────────────────────────────────────
      {
        path: "docente",
        name: "classroom-teacher-home",
        component: () => import("../pages/teacher/home.vue"),
        meta: {
          roles: ["TEACHER"],
          page: { base: { title: "Inicio · Docente" } },
        },
      },
      {
        path: "docente/cursos",
        name: "classroom-teacher-courses",
        component: () => import("../pages/teacher/courses.vue"),
        meta: {
          roles: ["TEACHER"],
          page: { base: { title: "Mis cursos" } },
        },
      },
      {
        path: "docente/sesiones",
        name: "classroom-teacher-sessions",
        component: () => import("../pages/teacher/sessions.vue"),
        meta: {
          roles: ["TEACHER"],
          page: { base: { title: "Sesiones de clase" } },
        },
      },
      {
        path: "docente/notas",
        name: "classroom-teacher-grading",
        component: () => import("../pages/teacher/grading.vue"),
        meta: {
          roles: ["TEACHER"],
          page: { base: { title: "Registro de notas" } },
        },
      },
      {
        path: "docente/evaluaciones",
        name: "classroom-teacher-evaluations",
        component: () => import("../pages/teacher/evaluations.vue"),
        meta: {
          roles: ["TEACHER"],
          page: { base: { title: "Cuadro de evaluación" } },
        },
      },
      {
        path: "docente/actas",
        name: "classroom-teacher-finals",
        component: () => import("../pages/teacher/finals.vue"),
        meta: {
          roles: ["TEACHER"],
          page: { base: { title: "Actas y notas finales" } },
        },
      },

      // ─── Coordinación ─────────────────────────────────────────────────
      {
        path: "coordinacion",
        name: "classroom-coordinator-home",
        component: () => import("../pages/coordinator/home.vue"),
        meta: {
          roles: ["COORDINATOR"],
          page: { base: { title: "Panel académico" } },
        },
      },
      {
        path: "coordinacion/programas",
        name: "classroom-coordinator-programs",
        component: () => import("../pages/coordinator/programs.vue"),
        meta: {
          roles: ["COORDINATOR"],
          page: { base: { title: "Programas" } },
        },
      },
      {
        path: "coordinacion/cohortes",
        name: "classroom-coordinator-cohorts",
        component: () => import("../pages/coordinator/cohorts.vue"),
        meta: {
          roles: ["COORDINATOR"],
          page: { base: { title: "Cohortes" } },
        },
      },
      {
        path: "coordinacion/docentes",
        name: "classroom-coordinator-teachers",
        component: () => import("../pages/coordinator/teachers.vue"),
        meta: {
          roles: ["COORDINATOR"],
          page: { base: { title: "Docentes" } },
        },
      },
      {
        path: "coordinacion/cierres",
        name: "classroom-coordinator-reports",
        component: () => import("../pages/coordinator/reports.vue"),
        meta: {
          roles: ["COORDINATOR"],
          page: { base: { title: "Cierres y pagos" } },
        },
      },
    ],
  },
];
