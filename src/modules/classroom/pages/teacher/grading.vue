<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import { ButtonCore } from "@/shared/components";
import teacherService from "../../services/teacher.service";
import type { GradebookDTO, TeacherCourseDTO } from "../../dto/teacher.dto";
import {
  AulaCard,
  AulaEmpty,
  AulaNotice,
  AulaPageHeader,
  AulaSkeleton,
  AulaStat,
} from "../../components/ui";
import { formatScore } from "../../utils/format";

const route = useRoute();
const toastStore = useToastStore();

const courses = ref<TeacherCourseDTO[]>([]);
const data = ref<GradebookDTO | null>(null);
const selectedCourse = ref<number | null>(null);
const loading = ref(true);
const loadingTable = ref(false);
const saving = ref(false);

/**
 * Notas en edición, indexadas por `alumno:evaluación`. Se inicializa con lo
 * guardado y solo se envía lo que el docente tocó.
 */
const edits = ref<Record<string, number | null>>({});

const cellKey = (studentId: number, evaluationId: number) =>
  `${studentId}:${evaluationId}`;

const hasChanges = computed(() => Object.keys(edits.value).length > 0);

/** Celdas sin nota donde la evaluación ya existe: lo que falta por registrar. */
const missing = computed(() =>
  (data.value?.students ?? []).reduce(
    (total, student) =>
      total + student.scores.filter((s) => s.score === null).length,
    0,
  ),
);

/** Promedio del aula por evaluación, para la fila de cierre. */
const averages = computed(() => {
  const result = new Map<number, number | null>();

  (data.value?.evaluations ?? []).forEach((evaluation) => {
    const scores = (data.value?.students ?? [])
      .map(
        (s) =>
          s.scores.find((x) => x.course_evaluation_id === evaluation.id)?.score,
      )
      .filter((s): s is number => s !== null && s !== undefined);

    result.set(
      evaluation.id,
      scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
    );
  });

  return result;
});

const scoreOf = (studentIndex: number, evaluationId: number) =>
  data.value?.students[studentIndex]?.scores.find(
    (s) => s.course_evaluation_id === evaluationId,
  ) ?? null;

const load = async (offerCourseId: number) => {
  loadingTable.value = true;
  edits.value = {};
  const { data: result } = await safeRequest(() =>
    teacherService.gradebook(offerCourseId),
  );
  data.value = result;
  loadingTable.value = false;
};

/**
 * Una celda vacía borra la nota (null), que no es lo mismo que un 0: el 0
 * significa que el alumno rindió y sacó cero.
 */
const onEdit = (studentId: number, evaluationId: number, value: string) => {
  const trimmed = value.trim();
  edits.value[cellKey(studentId, evaluationId)] =
    trimmed === "" ? null : Number(trimmed);
};

const save = async () => {
  if (!selectedCourse.value || !hasChanges.value) return;

  saving.value = true;
  const { data: ok } = await safeRequest(() =>
    teacherService.saveGrades(
      selectedCourse.value as number,
      Object.entries(edits.value).map(([key, score]) => {
        const [studentId, evaluationId] = key.split(":").map(Number);
        return {
          enrollment_course_id: studentId as number,
          course_evaluation_id: evaluationId as number,
          score,
        };
      }),
    ),
  );
  saving.value = false;

  if (ok) {
    toastStore.showToastSuccess({ detail: "Notas guardadas." });
    await load(selectedCourse.value);
  }
};

watch(selectedCourse, async (id) => {
  if (id) await load(id);
});

onMounted(async () => {
  const { data: list } = await safeRequest(() => teacherService.courses());
  courses.value = list ?? [];

  const fromQuery = Number(route.query.course);
  selectedCourse.value =
    courses.value.find((c) => c.id === fromQuery)?.id ??
    courses.value.find((c) => c.state === "in_progress")?.id ??
    courses.value[0]?.id ??
    null;

  loading.value = false;
});
</script>

<template>
  <div>
    <AulaPageHeader
      eyebrow="REGISTRO DE NOTAS"
      title="Registro de notas"
      sub="La matriz de alumnos por evaluación, con el acumulado de cada uno sobre 20."
    />

    <AulaSkeleton v-if="loading" kind="page" :rows="5" />

    <AulaEmpty
      v-else-if="!courses.length"
      title="No tienes cursos asignados"
      sub="Cuando coordinación te asigne un curso, sus alumnos y notas aparecerán acá."
    />

    <template v-else>
      <div class="mb-4">
        <label
          class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em] block mb-1.5"
        >
          Curso
        </label>
        <select
          v-model="selectedCourse"
          class="w-full max-w-120 px-3 py-2 rounded-adm-sm border border-line bg-surface-paper text-adm-base text-secondary-900"
        >
          <option v-for="course in courses" :key="course.id" :value="course.id">
            {{ course.course_name }} — {{ course.offer_name }}
          </option>
        </select>
      </div>

      <AulaSkeleton v-if="loadingTable" kind="table" :rows="8" />

      <template v-else-if="data">
        <div class="grid gap-3.5 sm:grid-cols-3 mb-5">
          <AulaStat label="Alumnos" :value="data.totals.students || '—'" />
          <AulaStat
            label="Evaluaciones"
            :value="data.evaluations.length || '—'"
            :delta="`suman ${data.totals.weight_total}%`"
            :tone="data.totals.weights_ok ? 'success' : 'danger'"
          />
          <AulaStat
            label="Notas por registrar"
            :value="missing || '—'"
            :delta="missing ? 'celdas vacías' : 'todo calificado'"
            :tone="missing ? 'warning' : 'success'"
          />
        </div>

        <AulaNotice v-if="missing" tone="warning" class="mb-4">
          Faltan {{ missing }} notas por registrar. El acta no se puede cerrar
          mientras queden celdas vacías.
        </AulaNotice>

        <AulaCard v-if="data.students.length && data.evaluations.length" pad="sm">
          <div class="overflow-x-auto">
            <table class="w-full text-adm-base" :style="{ minWidth: `${28 + data.evaluations.length * 8}rem` }">
              <thead>
                <tr
                  class="font-mono text-adm-xs text-secondary-400 uppercase tracking-[0.06em]"
                >
                  <th class="text-left px-2 py-2 font-medium sticky left-0 bg-surface-paper">
                    Alumno
                  </th>
                  <th
                    v-for="evaluation in data.evaluations"
                    :key="evaluation.id"
                    class="text-left px-2 py-2 font-medium"
                  >
                    {{ evaluation.name }}
                    <span class="block text-secondary-300 normal-case">
                      {{ Number(evaluation.weight) }}%
                    </span>
                  </th>
                  <th class="text-left px-2 py-2 font-medium">Acumulado</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(student, index) in data.students"
                  :key="student.enrollment_course_id"
                  class="border-t border-line-soft"
                >
                  <td
                    class="px-2 py-2.5 text-secondary-900 sticky left-0 bg-surface-paper"
                  >
                    {{ student.full_name }}
                    <span class="block font-mono text-adm-xs text-secondary-400">
                      {{ student.document_number }}
                    </span>
                  </td>
                  <td
                    v-for="evaluation in data.evaluations"
                    :key="evaluation.id"
                    class="px-2 py-2.5"
                  >
                    <input
                      type="number"
                      inputmode="decimal"
                      step="0.5"
                      min="0"
                      :max="Number(evaluation.max_score)"
                      :value="scoreOf(index, evaluation.id)?.score ?? ''"
                      placeholder="—"
                      class="w-16 px-2 py-1 rounded-adm-sm border text-adm-base font-display font-bold text-center"
                      :class="
                        edits[
                          cellKey(student.enrollment_course_id, evaluation.id)
                        ] !== undefined
                          ? 'border-primary-500 bg-accent-soft text-primary-600'
                          : 'border-line text-secondary-900'
                      "
                      @input="
                        onEdit(
                          student.enrollment_course_id,
                          evaluation.id,
                          ($event.target as HTMLInputElement).value,
                        )
                      "
                    />
                  </td>
                  <td class="px-2 py-2.5">
                    <span class="font-display font-bold text-secondary-900">
                      {{ formatScore(student.accumulated) }}
                    </span>
                    <span class="block font-mono text-adm-xs text-secondary-400">
                      {{ student.evaluated_weight }}% registrado
                    </span>
                  </td>
                </tr>

                <tr class="border-t border-line font-semibold">
                  <td
                    class="px-2 py-2.5 text-secondary-900 sticky left-0 bg-surface-paper"
                  >
                    Promedio del aula
                  </td>
                  <td
                    v-for="evaluation in data.evaluations"
                    :key="evaluation.id"
                    class="px-2 py-2.5 font-mono text-adm-sm"
                  >
                    {{ formatScore(averages.get(evaluation.id) ?? null) }}
                  </td>
                  <td class="px-2 py-2.5 font-mono text-adm-sm">
                    {{ data.totals.weight_total }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </AulaCard>

        <AulaEmpty
          v-else-if="!data.evaluations.length"
          title="Sin cuadro de evaluación"
          sub="Define primero las evaluaciones del curso; recién entonces se pueden registrar notas."
        />

        <AulaEmpty
          v-else
          title="Sin alumnos matriculados"
          sub="Este curso todavía no tiene alumnos en su grupo."
        />

        <div
          v-if="data.students.length && data.evaluations.length"
          class="flex flex-wrap items-center justify-between gap-3 mt-4"
        >
          <p class="text-adm-sm text-secondary-400">
            Una celda vacía borra la nota; un 0 significa que rindió y sacó
            cero. Volver a guardar corrige, no duplica.
          </p>
          <ButtonCore
            label="Guardar notas"
            :loading="saving"
            :disabled="!hasChanges"
            @click="save"
          />
        </div>
      </template>
    </template>
  </div>
</template>
