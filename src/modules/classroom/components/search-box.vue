<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter, type RouteLocationRaw } from "vue-router";
import { HeroCore } from "@/shared/components";
import { useClickOutsideMulti } from "@/shared/composables/useClickOutside";
import { safeRequest } from "@/shared/utils/request";
import {
  mdiMagnify,
  mdiBookOpenPageVariantOutline,
  mdiCalendarBlankOutline,
  mdiCertificateOutline,
  mdiChartBoxOutline,
  mdiSourceBranch,
} from "@mdi/js";
import studentService, { groupByOffer } from "../services/student.service";
import teacherService from "../services/teacher.service";
import coordinatorService from "../services/coordinator.service";
import { useClassroomRole } from "../composables/useClassroomRole";
import type { StudentCourse } from "../models/classroom.model";
import type { TeacherCourseDTO, TeacherSessionDTO } from "../dto/teacher.dto";
import type { QuotaDTO } from "../dto/coordinator.dto";
import { formatDate } from "../utils/format";
import { PROGRESS_LABEL } from "../constants/labels";

interface SearchItem {
  group: string;
  label: string;
  meta: string;
  icon: string;
  to: RouteLocationRaw;
}

const router = useRouter();

const query = ref("");
const open = ref(false);
const courses = ref<StudentCourse[]>([]);

/*
 * El buscador existe para los TRES roles, con índices distintos: el diseño
 * define qué busca cada uno. El alumno busca en lo suyo; el docente en sus
 * cursos y clases; coordinación en programas, cohortes y docentes.
 */
const { activeRole } = useClassroomRole();
const isStudent = computed(() => activeRole.value === "STUDENT");
const isTeacher = computed(() => activeRole.value === "TEACHER");

const teacherCourses = ref<TeacherCourseDTO[]>([]);
const teacherSessions = ref<TeacherSessionDTO[]>([]);
const cohorts = ref<QuotaDTO[]>([]);

const boxRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
useClickOutsideMulti([boxRef, panelRef], () => (open.value = false));

/**
 * Índice de búsqueda armado en el cliente.
 *
 * No hay endpoint de búsqueda: los datos del alumno ya están cargados y son
 * pocos (sus cursos, clases y evaluaciones). Pedirlos otra vez al servidor por
 * cada tecla sería peor que recorrerlos acá.
 */
/** Índice del docente: sus cursos de cohorte y sus clases. */
const teacherIndex = computed<SearchItem[]>(() => {
  const items: SearchItem[] = [];

  teacherCourses.value.forEach((course) =>
    items.push({
      group: "Mis cursos",
      label: course.course_name,
      meta: `${course.offer_name} · ${course.students_count} alumnos`,
      icon: mdiBookOpenPageVariantOutline,
      to: {
        name: "classroom-teacher-grading",
        query: { course: String(course.id) },
      },
    }),
  );

  teacherSessions.value.forEach((session) =>
    items.push({
      group: "Clases",
      label: session.topic ?? session.name ?? "Sesión",
      meta: `${session.course_name} · ${formatDate(session.session_date, true)}`,
      icon: mdiCalendarBlankOutline,
      to: {
        name: "classroom-teacher-sessions",
        query: { session: String(session.id) },
      },
    }),
  );

  return items;
});

const studentIndex = computed<SearchItem[]>(() => {
  const items: SearchItem[] = [];

  groupByOffer(courses.value)
    .filter((g) => g.offerType === "learning_path")
    .forEach((path) =>
      items.push({
        group: "Líneas de carrera",
        label: path.offerName,
        meta: `${path.done} de ${path.total} cursos`,
        icon: mdiSourceBranch,
        to: { name: "classroom-path", params: { offerId: path.offerId } },
      }),
    );

  courses.value.forEach((course) => {
    items.push({
      group: "Mis cursos",
      label: course.courseName,
      meta: `${course.offerName} · ${PROGRESS_LABEL[course.progressStatus] ?? ""}`,
      icon: mdiBookOpenPageVariantOutline,
      to: { name: "classroom-course", params: { id: course.id } },
    });

    course.sessions.forEach((session) =>
      items.push({
        group: "Clases",
        label: session.topic ?? session.name ?? "Sesión",
        meta: `${course.courseName} · ${formatDate(session.date, true)}`,
        icon: mdiCalendarBlankOutline,
        to: { name: "classroom-session", params: { sessionId: session.id } },
      }),
    );

    course.evaluations.forEach((evaluation) =>
      items.push({
        group: "Evaluaciones",
        label: evaluation.name,
        meta: `${course.courseName} · peso ${evaluation.weight}%`,
        icon: mdiChartBoxOutline,
        to: { name: "classroom-course", params: { id: course.id } },
      }),
    );

    if (course.certificate) {
      items.push({
        group: "Certificados",
        label: course.certificate.code,
        meta: `${course.courseName} · ${formatDate(course.certificate.issuedDate, true)}`,
        icon: mdiCertificateOutline,
        to: { name: "classroom-certificates" },
      });
    }
  });

  return items;
});

/**
 * Índice de coordinación: las cohortes abiertas, que es lo único indexable que
 * su API expone hoy (el resto son agregados). Buscar programas o docentes
 * exigiría endpoints nuevos.
 */
const coordinatorIndex = computed<SearchItem[]>(() =>
  cohorts.value.map((cohort) => ({
    group: "Cohortes",
    label: cohort.name,
    meta: [
      cohort.prefix,
      `${cohort.enrolled_students_count} de ${cohort.max_students || "—"} matriculados`,
    ]
      .filter(Boolean)
      .join(" · "),
    icon: mdiSourceBranch,
    to: { name: "classroom-coordinator-cohorts" },
  })),
);

/** Cada rol busca cosas distintas: el placeholder lo dice. */
const placeholder = computed(() => {
  if (isTeacher.value) return "Buscar curso o clase…";
  if (isStudent.value) return "Buscar curso, clase, evaluación…";
  return "Buscar cohorte…";
});

/** El índice del rol activo. */
const index = computed<SearchItem[]>(() => {
  if (isTeacher.value) return teacherIndex.value;
  if (isStudent.value) return studentIndex.value;
  return coordinatorIndex.value;
});

/** Sin tildes ni mayúsculas: buscar "practica" debe encontrar "Práctica". */
const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const results = computed(() => {
  const term = normalize(query.value.trim());
  // Con una sola letra casi todo coincide: el listado no ayudaría.
  if (term.length < 2) return [];

  const matched = index.value
    .filter(
      (item) =>
        normalize(item.label).includes(term) ||
        normalize(item.meta).includes(term),
    )
    .slice(0, 12);

  const groups = new Map<string, SearchItem[]>();
  matched.forEach((item) =>
    groups.set(item.group, [...(groups.get(item.group) ?? []), item]),
  );

  return [...groups.entries()];
});

const go = (item: SearchItem) => {
  open.value = false;
  query.value = "";
  router.push(item.to);
};

/** Cursos y clases del docente: dos llamadas, sin detalles por curso. */
const loadTeacher = async () => {
  const [coursesResp, sessionsResp] = await Promise.all([
    safeRequest(() => teacherService.courses(), { showAlert: false }),
    safeRequest(() => teacherService.sessions(), { showAlert: false }),
  ]);
  teacherCourses.value = coursesResp.data ?? [];
  teacherSessions.value = sessionsResp.data ?? [];
};

onMounted(async () => {
  /*
   * Cada rol pide lo suyo: los endpoints del alumno son `authorize:STUDENT` y
   * responderían 403 a un docente.
   */
  if (isTeacher.value) {
    await loadTeacher();
    return;
  }
  if (!isStudent.value) {
    const { data } = await safeRequest(() => coordinatorService.quotas(), {
      showAlert: false,
    });
    cohorts.value = data ?? [];
    return;
  }

  const { data } = await safeRequest(() => studentService.courses(), {
    showAlert: false,
  });
  const list = data ?? [];

  /*
   * El listado no trae clases ni evaluaciones: se piden los detalles de los
   * cursos accesibles para poder buscarlas. Los bloqueados se omiten — no
   * tienen contenido todavía.
   */
  const details = await Promise.all(
    list
      .filter((c) => c.progressStatus !== "locked")
      .map((c) =>
        safeRequest(() => studentService.course(c.id), { showAlert: false }),
      ),
  );

  const byId = new Map(
    details.flatMap(({ data: detail }) => (detail ? [[detail.id, detail]] : [])),
  );

  courses.value = list.map((c) => byId.get(c.id) ?? c);
});
</script>

<template>
  <div class="relative">
    <div
      ref="boxRef"
      class="flex items-center gap-2 px-3 h-9.5 rounded-pill border bg-surface-paper transition-colors"
      :class="open ? 'border-primary-500' : 'border-line'"
    >
      <HeroCore :path="mdiMagnify" class="size-4 text-secondary-400 shrink-0" />
      <input
        v-model="query"
        type="search"
        :placeholder="placeholder"
        class="w-56 xl:w-72 bg-transparent text-adm-base text-secondary-900 placeholder:text-secondary-400 outline-none"
        @focus="open = true"
      />
    </div>

    <transition name="fade-scale">
      <div
        v-if="open && query.trim().length >= 2"
        ref="panelRef"
        class="absolute right-0 top-12 w-100 max-w-[calc(100vw-2rem)] bg-surface-paper border border-line rounded-adm-lg shadow-lg z-9999 overflow-hidden"
      >
        <div class="max-h-105 overflow-y-auto">
          <template v-for="[group, list] in results" :key="group">
            <p
              class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em] px-4 pt-3 pb-1.5"
            >
              {{ group }}
            </p>
            <button
              v-for="(item, index) in list"
              :key="`${group}-${index}`"
              type="button"
              class="adm-row w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer"
              @click="go(item)"
            >
              <HeroCore
                :path="item.icon"
                class="size-4 text-secondary-400 shrink-0"
              />
              <div class="min-w-0">
                <p class="text-adm-base text-secondary-900 truncate">
                  {{ item.label }}
                </p>
                <p class="text-adm-sm text-secondary-500 truncate">
                  {{ item.meta }}
                </p>
              </div>
            </button>
          </template>

          <p
            v-if="!results.length"
            class="text-adm-base text-secondary-500 px-4 py-6 text-center"
          >
            Sin resultados para «{{ query.trim() }}».
          </p>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s cubic-bezier(0.2, 0.7, 0.3, 1);
  transform-origin: top right;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
