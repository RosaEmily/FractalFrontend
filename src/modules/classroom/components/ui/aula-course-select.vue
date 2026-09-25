<script setup lang="ts">
import { computed } from "vue";
import type { TeacherCourseDTO } from "../../dto/teacher.dto";

/**
 * Selector del curso que dicta el docente. Lo comparten las 4 pantallas de
 * `pages/teacher/` (clases, notas, evaluaciones y actas): las cuatro listan los
 * mismos `offer_courses` y guardan el id en el mismo `selectedCourse`.
 *
 * ⚠️ Son BOTONES-TARJETA, no un desplegable — así lo define el diseño
 * (`shell.jsx` → `AulaCourseSwitch`). Un `<select>` escondía el grupo y el
 * número de alumnos, que es justo lo que distingue dos cursos con el mismo
 * nombre dictados en cohortes distintas.
 *
 * ⚠️ Los cursos del MISMO grupo van dentro de una caja con su cabecera. Un
 * docente con dos cursos de la misma cohorte veía dos botones sueltos que
 * repetían "Grupo BIM-2026-03" y no dejaban ver que son el mismo programa.
 * Con un solo curso el grupo no aporta caja: va como botón suelto con la
 * cohorte en su propia meta.
 *
 * ⚠️ Un curso no elegible se ATENÚA, no desaparece: que "Navisworks" no esté
 * en la lista no dice nada, pero verlo en gris con el motivo
 * ("Sin cuadro de evaluación") explica qué falta para poder entrar.
 */
const props = withDefaults(
  defineProps<{
    courses: TeacherCourseDTO[];
    /**
     * Qué cursos son elegibles en ESTA pantalla. El resto se pinta atenuado.
     * Por defecto todos: el selector no impone reglas que no le constan.
     */
    filter?: (course: TeacherCourseDTO) => boolean;
    /** Motivo que sustituye a la meta del curso no elegible. */
    disabledHint?: string;
  }>(),
  { filter: undefined, disabledHint: "No disponible aún" },
);

const model = defineModel<number | null>({ default: null });

const isEnabled = (course: TeacherCourseDTO): boolean =>
  props.filter ? props.filter(course) : true;

/** Los cursos agrupados por cohorte, conservando el orden en que llegan. */
const groups = computed(() => {
  const byOffer = new Map<number, TeacherCourseDTO[]>();

  for (const course of props.courses) {
    const found = byOffer.get(course.offer_id);

    if (found) found.push(course);
    else byOffer.set(course.offer_id, [course]);
  }

  return [...byOffer.entries()].map(([offerId, own]) => ({
    offerId,
    name: own[0]?.offer_name ?? "",
    prefix: own[0]?.offer_prefix ?? own[0]?.offer_name ?? "",
    courses: own,
  }));
});

const studentsLabel = (course: TeacherCourseDTO): string =>
  `${course.students_count} ${course.students_count === 1 ? "alumno" : "alumnos"}`;

const select = (course: TeacherCourseDTO) => {
  if (isEnabled(course)) model.value = course.id;
};
</script>

<template>
  <div class="flex flex-wrap items-start gap-3 mb-5">
    <template v-for="group in groups" :key="group.offerId">
      <!-- Varios cursos de la misma cohorte: caja con la cabecera del grupo. -->
      <div
        v-if="group.courses.length > 1"
        class="flex flex-col gap-2 rounded-adm-md border-[1.5px] border-line bg-surface-paper px-3 py-2.5"
      >
        <div class="flex items-baseline gap-2 px-0.5">
          <span class="font-display text-adm-sm font-bold text-secondary-900">
            {{ group.name }}
          </span>
          <span
            class="font-mono text-adm-xs uppercase tracking-[0.04em] text-secondary-400"
          >
            Grupo {{ group.prefix }}
          </span>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="course in group.courses"
            :key="course.id"
            type="button"
            class="box-border rounded-adm-sm border-[1.5px] px-3.5 py-2 text-left transition-colors"
            :class="[
              course.id === model
                ? 'border-primary-500 bg-accent-soft'
                : 'border-line bg-surface-page',
              isEnabled(course)
                ? 'cursor-pointer'
                : 'cursor-not-allowed opacity-45',
            ]"
            :title="isEnabled(course) ? undefined : disabledHint"
            @click="select(course)"
          >
            <span
              class="block text-adm-base font-semibold"
              :class="
                course.id === model ? 'text-primary-600' : 'text-secondary-900'
              "
            >
              {{ course.course_name }}
            </span>
            <span
              class="mt-0.5 block font-mono text-adm-xs uppercase tracking-[0.04em]"
              :class="
                course.id === model ? 'text-primary-600' : 'text-secondary-400'
              "
            >
              {{ isEnabled(course) ? studentsLabel(course) : disabledHint }}
            </span>
          </button>
        </div>
      </div>

      <!-- Curso único del grupo: botón suelto, con la cohorte en su meta. -->
      <button
        v-for="course in group.courses.length > 1 ? [] : group.courses"
        :key="course.id"
        type="button"
        class="box-border rounded-adm-md border-[1.5px] px-3.5 py-2.5 text-left transition-colors"
        :class="[
          course.id === model
            ? 'border-primary-500 bg-accent-soft'
            : 'border-line bg-surface-paper',
          isEnabled(course) ? 'cursor-pointer' : 'cursor-not-allowed opacity-45',
        ]"
        :title="isEnabled(course) ? undefined : disabledHint"
        @click="select(course)"
      >
        <span
          class="block text-adm-base font-semibold"
          :class="
            course.id === model ? 'text-primary-600' : 'text-secondary-900'
          "
        >
          {{ course.course_name }}
        </span>
        <span
          class="mt-0.5 block font-mono text-adm-xs uppercase tracking-[0.04em]"
          :class="
            course.id === model ? 'text-primary-600' : 'text-secondary-400'
          "
        >
          <template v-if="isEnabled(course)">
            Grupo {{ group.prefix }} · {{ studentsLabel(course) }}
          </template>
          <template v-else>{{ disabledHint }}</template>
        </span>
      </button>
    </template>
  </div>
</template>
