<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { FilterMatchMode } from "@primevue/core/api";
import { mdiClose, mdiRestore } from "@mdi/js";

import {
  SelectCore,
  InputTextCore,
  InputNumberCore,
  HeroCore,
} from "@/shared/components";
import BulkFormShell from "@/modules/admin/components/ui/bulk-form-shell.vue";
import BulkCourseCard from "@/modules/admin/components/ui/bulk-course-card.vue";
import ModeToggle from "@/modules/admin/components/ui/mode-toggle.vue";
import { safeRequest } from "@/shared/utils/request";
import { useToastStore } from "@/shared/stores/useToastStore";
import enrollmentService from "@/modules/admin/modules/enrollments/modules/enrollments/services/enrollment.service";
import type { Enrollment } from "@/modules/admin/modules/enrollments/modules/enrollments/models/enrollment.model";
import courseEvaluationService from "../../course-evaluations/services/course-evaluation.service";
import studentEvaluationService from "../services/student-evaluation.service";

/**
 * Alta MASIVA de notas: se elige una matrícula y se listan todos sus cursos,
 * cada uno con las evaluaciones que ya configuró el docente.
 *
 * El nombre de la evaluación y su puntaje máximo NO son editables: vienen del
 * cuadro de evaluación. Acá solo se pone la nota y la retroalimentación.
 */
interface GradeRow {
  courseEvaluationId: number;
  evaluationName: string;
  maxScore: number;
  score: number | null;
  feedback: string;
  include: boolean;
}

interface CourseCard {
  enrollmentCourseId: number;
  courseName: string;
  rows: GradeRow[];
}

const mode = defineModel<string>("mode", { required: true });

const MODE_OPTIONS = [
  { value: "individual", label: "Un estudiante" },
  { value: "bulk", label: "Varios cursos" },
];

const router = useRouter();
const toastStore = useToastStore();

const enrollmentId = ref<number | null>(null);
const enrollments = ref<Enrollment[]>([]);
const cards = ref<CourseCard[]>([]);
const loading = ref(false);
const saving = ref(false);

const loadEnrollments = async (): Promise<Enrollment[]> => {
  const { data } = await safeRequest(() => enrollmentService.all(), {
    showAlert: false,
  });
  enrollments.value = data ?? [];
  return enrollments.value;
};

const onEnrollmentChange = async () => {
  cards.value = [];
  if (!enrollmentId.value) return;

  const enrollment = enrollments.value.find((e) => e.id === enrollmentId.value);
  const courses = enrollment?.courses ?? [];
  if (!courses.length) return;

  loading.value = true;
  /*
   * Las evaluaciones se piden UNA vez para todos los cursos de la matrícula,
   * filtrando por sus `offer_course_id` con `in`: una petición por curso
   * multiplicaría las llamadas sin ganar nada.
   */
  const { data } = await safeRequest(
    () =>
      courseEvaluationService.all({
        filters: {
          offer_course_id: {
            value: courses.map((c) => c.offerCourseId),
            matchMode: FilterMatchMode.IN,
          },
          status: { value: 1, matchMode: FilterMatchMode.EQUALS },
        },
      }),
    { showAlert: false },
  );
  loading.value = false;

  const evaluations = data ?? [];

  cards.value = courses.map((course) => ({
    enrollmentCourseId: course.id,
    courseName: course.name,
    rows: evaluations
      .filter((ev) => ev.offerCourseId === course.offerCourseId)
      .map((ev) => ({
        courseEvaluationId: ev.id,
        evaluationName: ev.name,
        maxScore: Number(ev.maxScore) || 20,
        score: null,
        feedback: "",
        include: true,
      })),
  }));
};

/*
 * Solo se envían las filas con nota puesta: mandar una fila vacía escribiría
 * `null` sobre una nota que ya existía. Una celda vacía acá significa "no la
 * estoy tocando", no "bórrala".
 */
const filledRows = (card: CourseCard) =>
  card.rows.filter((r) => r.include && r.score !== null);

const total = computed(() =>
  cards.value.reduce((acc, card) => acc + filledRows(card).length, 0),
);

const submitLabel = computed(() =>
  total.value
    ? `Guardar ${total.value} nota${total.value === 1 ? "" : "s"}`
    : "Guardar notas",
);

const onSubmit = async () => {
  if (!total.value) return;

  const body = cards.value.flatMap((card) =>
    filledRows(card).map((row) => ({
      enrollment_course_id: card.enrollmentCourseId,
      course_evaluation_id: row.courseEvaluationId,
      score: row.score,
      feedback: row.feedback.trim() || null,
      evaluated_at: null,
    })),
  );

  saving.value = true;
  const { error } = await safeRequest(() =>
    studentEvaluationService.bulkSync(body),
  );
  saving.value = false;

  if (error) return;

  toastStore.showToastSuccess({
    summary: "Notas guardadas",
    detail: `Se guardaron ${body.length} nota(s).`,
  });
  router.replace({ name: "studentEvaluations.list" });
};
</script>

<template>
  <BulkFormShell
    title="Registrar notas de varios cursos"
    :submit-label="submitLabel"
    redirect="studentEvaluations.list"
    :loading="saving"
    :disabled="!total"
    @submit="onSubmit"
  >
    <ModeToggle v-model="mode" :options="MODE_OPTIONS" />

    <SelectCore
      v-model="enrollmentId"
      label="Matrícula"
      required
      hint-label="Se listan sus cursos con las evaluaciones ya configuradas."
      filter
      option-label="studentName"
      option-value="id"
      placeholder="Selecciona una matrícula"
      :service="loadEnrollments"
      auto-load
      @update:model-value="onEnrollmentChange"
    />

    <p v-if="loading" class="text-sm text-secondary-400">
      Cargando las evaluaciones de los cursos…
    </p>

    <div
      v-else-if="enrollmentId && !cards.length"
      class="rounded-adm-sm border-[1.5px] border-dashed border-control-border px-3.5 py-5 text-center text-sm text-secondary-400"
    >
      Esta matrícula todavía no tiene cursos.
    </div>

    <div v-else-if="cards.length" class="flex flex-col gap-3">
      <BulkCourseCard
        v-for="card in cards"
        :key="card.enrollmentCourseId"
        :title="card.courseName"
        :meta="`${card.rows.length} evaluación(es)`"
      >
        <!--
          El vacío depende del filtro: que un curso no tenga cuadro de
          evaluación no es lo mismo que no tener notas.
        -->
        <p
          v-if="!card.rows.length"
          class="py-2 text-center text-xs text-secondary-400"
        >
          Este curso todavía no tiene evaluaciones configuradas.
        </p>

        <div v-else class="flex flex-col gap-2">
          <div
            v-for="row in card.rows"
            :key="row.courseEvaluationId"
            class="grid grid-cols-[130px_1fr_90px_32px] items-center gap-2 transition-opacity"
            :class="{ 'opacity-40': !row.include }"
          >
            <span
              class="truncate text-xs font-semibold text-secondary-500"
              :title="row.evaluationName"
            >
              {{ row.evaluationName }}
            </span>
            <InputTextCore
              v-model="row.feedback"
              :disabled="!row.include"
              placeholder="Retroalimentación (opcional)"
            />
            <InputNumberCore
              v-model="row.score"
              :disabled="!row.include"
              :min="0"
              :max="row.maxScore"
              :max-fraction-digits="2"
              :placeholder="`Nota /${row.maxScore}`"
            />
            <button
              type="button"
              class="adm-icon-btn inline-flex size-7 items-center justify-center rounded-adm-sm text-secondary-500"
              :title="row.include ? 'Quitar' : 'Volver a incluir'"
              @click="row.include = !row.include"
            >
              <HeroCore :path="row.include ? mdiClose : mdiRestore" size="16" />
            </button>
          </div>
        </div>
      </BulkCourseCard>
    </div>
  </BulkFormShell>
</template>
