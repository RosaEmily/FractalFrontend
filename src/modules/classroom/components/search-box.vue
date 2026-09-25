<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter, type RouteLocationRaw } from "vue-router";
import { HeroCore, InputTextCore } from "@/shared/components";
import { useClickOutsideMulti } from "@/shared/composables/useClickOutside";
import { safeRequest } from "@/shared/utils/request";
import {
  mdiMagnify,
  mdiBookOpenPageVariantOutline,
  mdiCalendarBlankOutline,
  mdiCertificateOutline,
  mdiChartBoxOutline,
  mdiSourceBranch,
  mdiClose,
  mdiAccountOutline,
  mdiChevronRight,
} from "@mdi/js";
import studentService, { groupByOffer } from "../services/student.service";
import teacherService from "../services/teacher.service";
import coordinatorService from "../services/coordinator.service";
import { useClassroomRole } from "../composables/useClassroomRole";
import type { StudentCourse } from "../models/classroom.model";
import type {
  GradebookDTO,
  TeacherCourseDTO,
  TeacherSessionDTO,
} from "../dto/teacher.dto";
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

/**
 * `compact`: el buscador ocupa TODO el ancho disponible en vez del campo fijo
 * de la topbar, y el panel se ancla a la izquierda. Es lo que el diseño usa en
 * la página de búsqueda (`AulaSearchBox compact`).
 */
const props = withDefaults(defineProps<{ compact?: boolean }>(), {
  compact: false,
});

const query = ref("");
const open = ref(false);
const inputRef = ref<{ $el: HTMLElement } | null>(null);

const clearQuery = () => {
  query.value = "";
  open.value = false;
};

/**
 * Atajo `/` del diseño: enfoca el buscador desde cualquier pantalla del aula.
 *
 * ⚠️ Se ignora mientras se escribe en otro campo, o teclear una fecha o un tema
 * con una barra robaría el foco a mitad de palabra.
 */
const onKeydown = (event: KeyboardEvent) => {
  if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  const target = event.target as HTMLElement | null;
  const tag = target?.tagName;

  if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
    return;
  }

  const input = nativeInput();

  if (!input) return;

  event.preventDefault();
  input.focus();
  open.value = true;
};

/**
 * El `<input>` real dentro de `InputTextCore`.
 *
 * ⚠️ El componente envuelve al de PrimeVue en un `<div>`, así que `$el` NO es
 * el input: hay que bajar a buscarlo.
 */
const nativeInput = (): HTMLInputElement | null =>
  inputRef.value?.$el instanceof HTMLInputElement
    ? inputRef.value.$el
    : (inputRef.value?.$el?.querySelector("input") ?? null);

/**
 * Un clic en cualquier punto de la píldora enfoca el campo.
 *
 * El `<input>` no ocupa toda la caja —a su lado están la lupa y la tecla `/`—,
 * así que sin esto un clic en esos huecos no hacía nada.
 */
const focusInput = (event: MouseEvent) => {
  // Un clic en la X de limpiar tiene su propio handler: no robarle el foco.
  if ((event.target as HTMLElement)?.closest("button")) return;

  nativeInput()?.focus();
};
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

/**
 * Alumnos y evaluaciones por curso del docente.
 *
 * El diseño incluye ambos en su índice (notify.jsx:142): buscar a un alumno
 * por nombre o DNI es el caso de uso principal del docente. Salen del
 * `gradebook`, que devuelve las dos cosas en UNA llamada por curso.
 */
const teacherGradebooks = ref<{ course: string; data: GradebookDTO }[]>([]);
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

  /*
   * El DNI va en `meta`, así que se busca por nombre O por documento — es como
   * el docente identifica a un alumno cuando el nombre se repite.
   *
   * ⚠️ Un alumno en dos cursos sale dos veces, y está bien: el destino es la
   * grilla de notas de UN curso, así que son dos resultados distintos.
   */
  teacherGradebooks.value.forEach(({ course, data }) => {
    data.students.forEach((student) =>
      items.push({
        group: "Alumnos",
        label: student.full_name,
        meta: `DNI ${student.document_number} · ${course}`,
        icon: mdiAccountOutline,
        to: { name: "classroom-teacher-grading" },
      }),
    );

    data.evaluations.forEach((evaluation) =>
      items.push({
        group: "Evaluaciones",
        label: evaluation.name,
        meta: `${course} · peso ${evaluation.weight}%`,
        icon: mdiChartBoxOutline,
        to: { name: "classroom-teacher-evaluations" },
      }),
    );
  });

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
    group: "Grupos",
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

/**
 * Qué puede encontrar cada rol. Texto literal del diseño (notify.jsx:167).
 *
 * ⚠️ El del docente dice "alumnos por nombre o DNI" pero su índice solo tiene
 * cursos y clases: se ajusta a lo que la pantalla realmente busca, o prometería
 * una búsqueda que no existe.
 */
const helpText = computed(() => {
  if (isTeacher.value) return "Cursos, temas de clase y evaluaciones.";
  if (isStudent.value) {
    return "Cursos, líneas de carrera, temas de clase, evaluaciones, certificados y matrículas.";
  }

  return "Cohortes, docentes y alumnos.";
});

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

/**
 * Atajos de ejemplo. El diseño los trae fijos ("Pedro Salas", "ductos"), pero
 * eso son datos del mockup: si se copian, un clic busca algo que no existe en
 * esta instalación. Salen del índice REAL, así que siempre dan resultado.
 */
const suggestions = computed(() =>
  [...new Set(index.value.map((item) => item.label))]
    .filter((label) => label.length <= 28)
    .slice(0, 4),
);

const results = computed(() => {
  const term = normalize(query.value.trim());
  // Con una sola letra casi todo coincide: el listado no ayudaría.
  if (term.length < 2) return [];

  /*
   * ⚠️ El GRUPO también entra en la búsqueda, como el diseño
   * (`label + ' ' + meta + ' ' + group`, notify.jsx:162). Sin él, escribir
   * "clases" o "evaluaciones" —el nombre de la sección que el propio panel
   * muestra como encabezado— no encontraba NADA.
   */
  const matched = index.value
    .filter((item) =>
      normalize(`${item.label} ${item.meta} ${item.group}`).includes(term),
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

/** Cursos, clases, alumnos y evaluaciones del docente. */
const loadTeacher = async () => {
  const [coursesResp, sessionsResp] = await Promise.all([
    safeRequest(() => teacherService.courses(), { showAlert: false }),
    safeRequest(() => teacherService.sessions(), { showAlert: false }),
  ]);
  teacherCourses.value = coursesResp.data ?? [];
  teacherSessions.value = sessionsResp.data ?? [];

  /*
   * Un `gradebook` por curso, en paralelo. Son pocos —un docente lleva 2 o 3
   * cursos— y cada uno trae sus alumnos Y sus evaluaciones, así que no hay un
   * endpoint más barato. Si alguno falla, el índice se arma sin él en vez de
   * quedarse sin buscador.
   */
  const books = await Promise.all(
    teacherCourses.value.map(async (course) => {
      const { data } = await safeRequest(
        () => teacherService.gradebook(course.id),
        { showAlert: false },
      );

      return data ? { course: course.course_name, data } : null;
    }),
  );

  teacherGradebooks.value = books.filter((b) => b !== null);
};

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));

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
  <div class="relative" :class="props.compact ? 'w-full' : ''">
    <!--
      ⚠️ `@focusin`, no `@focus`, y en el CONTENEDOR.

      `InputTextCore` envuelve al input de PrimeVue en un `<div>`, así que un
      `@focus` pasado al componente cae en ese div por fallthrough — y `focus`
      NO BURBUJEA, de modo que nunca se disparaba: hacer clic en el campo no
      abría el panel. `focusin` sí burbujea, y acá además cubre el clic en la
      lupa y en la tecla `/`.
    -->
    <div
      ref="boxRef"
      class="flex items-center gap-2 px-3.5 h-9.5 rounded-pill border bg-surface-page transition-colors"
      :class="open ? 'border-primary-500' : 'border-line'"
      @focusin="open = true"
      @click="focusInput"
    >
      <HeroCore
        :path="mdiMagnify"
        class="size-4 shrink-0"
        :class="open ? 'text-primary-500' : 'text-secondary-400'"
      />
      <InputTextCore
        ref="inputRef"
        v-model="query"
        :class="['field-bare', props.compact ? 'w-full' : 'w-56 xl:w-72']"
        type="search"
        :placeholder="placeholder"
      />
      <!--
        El atajo del diseño (notify.jsx:181): la tecla se anuncia cuando el
        campo está vacío, y deja paso a la X para limpiar en cuanto se escribe.
      -->
      <button
        v-if="query"
        type="button"
        class="inline-flex shrink-0 cursor-pointer"
        title="Limpiar la búsqueda"
        @click="clearQuery"
      >
        <HeroCore :path="mdiClose" class="size-4 text-secondary-400" />
      </button>
      <span
        v-else
        class="shrink-0 rounded-[0.3125rem] border border-line px-1.5 py-px font-mono text-adm-xs text-secondary-400"
      >
        /
      </span>
    </div>

    <transition name="fade-scale">
      <!--
        ⚠️ El panel se abre al ENFOCAR, no a los 2 caracteres. Antes el `v-if`
        exigía `length >= 2`, así que al hacer clic no pasaba nada: ni la ayuda
        de qué se puede buscar ni las sugerencias del diseño (notify.jsx:183)
        llegaban a montarse, y tampoco el "Sin resultados".
      -->
      <div
        v-if="open"
        ref="panelRef"
        class="absolute top-12 bg-surface-paper border border-line rounded-adm-lg shadow-lg z-9999 overflow-hidden"
        :class="
          props.compact
            ? 'left-0 right-0'
            : 'right-0 w-100 max-w-[calc(100vw-2rem)]'
        "
      >
        <!-- Estado 1: todavía no se escribió nada útil. -->
        <div v-if="query.trim().length < 2" class="px-4.5 py-4">
          <p
            class="mb-2.5 font-mono text-adm-xs uppercase tracking-[0.06em] text-secondary-400"
          >
            Busca por
          </p>
          <p class="mb-3 text-adm-base leading-relaxed text-secondary-500">
            {{ helpText }}
          </p>
          <div v-if="suggestions.length" class="flex flex-wrap gap-1.5">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion"
              type="button"
              class="cursor-pointer rounded-pill border border-line bg-surface-page px-2.5 py-1 text-adm-sm text-secondary-500"
              @click="query = suggestion"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>

        <div v-else class="max-h-105 overflow-y-auto">
          <template v-for="[group, list] in results" :key="group">
            <!--
              Fondo y línea arriba como el diseño (notify.jsx:203).

              ⚠️ SIN el nombre de la tabla que el diseño pone al lado
              (`ALUMNOS · STUDENTS`): es una anotación del mockup para quien
              construye, igual que `COURSE_EVALUATIONS.MAX_SCORE`. Al usuario
              no le dice nada y encima está en inglés.
            -->
            <p
              class="border-t border-line-soft bg-surface-page px-4 pt-2.5 pb-1.5 font-mono text-adm-xs uppercase tracking-[0.06em] text-secondary-400"
            >
              {{ group }}
            </p>
            <button
              v-for="(item, index) in list"
              :key="`${group}-${index}`"
              type="button"
              class="adm-row w-full flex items-center gap-2.75 px-4 py-2.75 text-left cursor-pointer"
              @click="go(item)"
            >
              <HeroCore
                :path="item.icon"
                class="size-4.5 text-secondary-400 shrink-0"
              />
              <div class="min-w-0 flex-1">
                <p class="text-adm-md font-semibold text-secondary-900 truncate">
                  {{ item.label }}
                </p>
                <p class="text-adm-sm text-secondary-400 truncate">
                  {{ item.meta }}
                </p>
              </div>
              <!-- El chevron dice que la fila NAVEGA, no que se selecciona. -->
              <HeroCore
                :path="mdiChevronRight"
                class="size-4 shrink-0 text-secondary-400"
              />
            </button>
          </template>

          <!-- Sin resultados: el diseño repite la ayuda, no deja el hueco. -->
          <div v-if="!results.length" class="px-4.5 py-5.5 text-center">
            <p class="text-adm-md font-semibold text-secondary-900">
              Sin resultados para «{{ query.trim() }}»
            </p>
            <p class="mt-1.5 text-adm-base text-secondary-500">
              {{ helpText }}
            </p>
          </div>
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
