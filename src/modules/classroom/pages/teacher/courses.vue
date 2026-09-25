<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { safeRequest } from "@/shared/utils/request";
import teacherService from "../../services/teacher.service";
import type { TeacherCourseDTO } from "../../dto/teacher.dto";
import {
  AulaEmpty,
  AulaNotice,
  AulaPageHeader,
  AulaSkeleton,
} from "../../components/ui";
import { formatDate } from "../../utils/format";

const router = useRouter();

const courses = ref<TeacherCourseDTO[]>([]);
const loading = ref(true);

/**
 * Orden del diseño: primero lo que está en curso, luego lo próximo a iniciar,
 * al final lo cerrado.
 *
 * Es el orden en que el docente los necesita: lo que dicta ahora es lo que
 * abre todos los días, y un curso cerrado solo se visita para ver su acta.
 */
const STATE_ORDER: Record<string, number> = {
  in_progress: 0,
  overdue: 1,
  not_started: 2,
  completed: 3,
};

const rank = (course: TeacherCourseDTO) => STATE_ORDER[course.state] ?? 9;

/**
 * Los cursos van AGRUPADOS POR GRUPO, no sueltos.
 *
 * Un docente con dos cursos de la misma cohorte veía dos tarjetas que repetían
 * el mismo código de grupo, sin nada que dijera que son el mismo programa. La
 * cabecera del grupo lo dice una vez y las tarjetas quedan para el curso.
 */
const groups = computed(() => {
  const byOffer = new Map<number, TeacherCourseDTO[]>();

  for (const course of courses.value) {
    const found = byOffer.get(course.offer_id);

    if (found) found.push(course);
    else byOffer.set(course.offer_id, [course]);
  }

  return [...byOffer.entries()]
    .map(([offerId, own]) => ({
      offerId,
      name: own[0]?.offer_name ?? "",
      prefix: own[0]?.offer_prefix ?? own[0]?.offer_name ?? "",
      courses: [...own].sort((a, b) => rank(a) - rank(b)),
    }))
    // El grupo hereda la urgencia de su curso más urgente.
    .sort((a, b) => rank(a.courses[0]!) - rank(b.courses[0]!));
});

/**
 * La línea de estado del curso, en el orden de prioridad del diseño.
 *
 * Responde "¿qué pasa con este curso?" en cuatro palabras: lo que falta pesa
 * más que lo que ya está, por eso "Sin clases generadas" gana a la fecha.
 */
const metaChip = (course: TeacherCourseDTO): string => {
  if (!course.sessions_total) return "Sin clases generadas";
  if (course.state === "not_started")
    return `Inicia ${formatDate(course.start_date)}`;
  if (course.state === "completed") return "Cerrado";

  return `${course.students_count} ${course.students_count === 1 ? "alumno" : "alumnos"}`;
};

/**
 * El PRIMER curso del grupo va destacado, salvo que esté cerrado.
 *
 * Los cursos vienen ordenados por urgencia, así que el primero es el que el
 * docente está dictando ahora: el acento le dice por dónde entrar sin leer
 * los cuatro chips.
 */
const isFeatured = (own: TeacherCourseDTO[], index: number): boolean =>
  index === 0 && own[index]?.state !== "completed";

/**
 * Un curso en marcha lleva a sus clases; uno cerrado, a su acta. Es lo que el
 * docente quiere hacer en cada caso.
 */
const open = (course: TeacherCourseDTO) => {
  // El chip atenuado no navega: sin sesiones no hay pantalla que abrir.
  if (!course.sessions_total) return;

  router.push({
    name:
      course.state === "completed"
        ? "classroom-teacher-finals"
        : "classroom-teacher-sessions",
    query: { course: course.id },
  });
};

/** Cursos sin clases generadas: los nombra el aviso del pie. */
const withoutSessions = computed(() =>
  courses.value.filter((c) => !c.sessions_total),
);

onMounted(async () => {
  const { data } = await safeRequest(() => teacherService.courses());
  courses.value = data ?? [];
  loading.value = false;
});
</script>

<template>
  <div>
    <AulaPageHeader
      eyebrow="ASIGNACIÓN DOCENTE"
      title="Mis cursos"
      sub="Cada curso que dictas es un curso dentro de un grupo, con su propio horario, sus clases y su cuadro de evaluación. Primero lo que está en curso, luego lo próximo a iniciar, al final lo cerrado."
    />

    <AulaSkeleton v-if="loading" kind="table" :rows="4" />

    <div v-else-if="courses.length" class="flex flex-col gap-4">
      <!-- Una caja por GRUPO; sus cursos van dentro. -->
      <div
        v-for="group in groups"
        :key="group.offerId"
        class="rounded-adm-lg border-[1.5px] border-line bg-surface-paper p-4"
      >
        <div class="flex items-baseline gap-2.5 flex-wrap mb-3 px-0.5">
          <span class="font-display text-adm-base font-bold text-secondary-900">
            {{ group.name }}
          </span>
          <span
            class="font-mono text-adm-xs uppercase tracking-[0.04em] text-secondary-400"
          >
            Grupo {{ group.prefix }} ·
            {{
              group.courses.length === 1
                ? "curso suelto"
                : `${group.courses.length} cursos a tu cargo`
            }}
          </span>
        </div>

        <!--
          CHIPS, no tarjetas: el diseño (`teacher.jsx:140`) pinta un botón
          compacto por curso con el nombre y UNA línea de meta.

          ⚠️ Las tarjetas con Alumnos/Clases/Pesos y barra de avance eran
          invención mía: llenaban la pantalla de números que el docente no
          necesita para ELEGIR un curso, y con 4 grupos había que hacer scroll
          para ver qué dicta.
        -->
        <div class="flex flex-wrap gap-2.5">
          <button
            v-for="(course, index) in group.courses"
            :key="course.id"
            type="button"
            class="box-border min-w-[10.5rem] rounded-adm-md border-[1.5px] px-3.5 py-2.5 text-left transition-colors"
            :class="[
              isFeatured(group.courses, index)
                ? 'border-primary-500 bg-accent-soft'
                : 'border-line bg-surface-page',
              course.sessions_total
                ? 'cursor-pointer'
                : 'cursor-default opacity-50',
            ]"
            :title="
              course.sessions_total
                ? undefined
                : 'Todavía sin ficha completa (sesiones/notas) cargada'
            "
            @click="open(course)"
          >
            <span
              class="block text-adm-base font-bold"
              :class="
                isFeatured(group.courses, index)
                  ? 'text-primary-600'
                  : 'text-secondary-900'
              "
            >
              {{ course.course_name }}
            </span>
            <span
              class="mt-[0.1875rem] block font-mono text-adm-xs uppercase tracking-[0.03em]"
              :class="
                isFeatured(group.courses, index)
                  ? 'text-primary-600'
                  : 'text-secondary-400'
              "
            >
              {{ metaChip(course) }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <AulaEmpty
      v-else
      title="Aún no tienes cursos asignados"
      sub="Coordinación académica te asigna los cursos de cada grupo antes de que empiecen."
    />

    <!--
      El aviso NOMBRA el curso: "hay cursos sin clases" obliga a revisarlos uno
      por uno para encontrar cuál.
    -->
    <AulaNotice
      v-if="withoutSessions.length"
      tone="warning"
      class="mt-5"
      :title="`${withoutSessions[0]?.course_name} · ${withoutSessions[0]?.offer_prefix ?? withoutSessions[0]?.offer_name} inicia el ${formatDate(withoutSessions[0]?.start_date ?? null, true)} sin clases generadas`"
    >
      El horario ya existe pero no hay clases creadas, así que los alumnos no
      ven fechas ni enlaces. Las genera coordinación académica desde el horario.
    </AulaNotice>
  </div>
</template>
