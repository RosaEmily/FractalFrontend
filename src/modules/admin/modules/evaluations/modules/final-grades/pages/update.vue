<script setup lang="ts">
import { z } from "zod";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import {
  InputNumberCore,
  DatePicketCore,
  ToggleCore,
  LabelCore,
} from "@/shared/components";
import EnrollmentCourseSelect from "@/modules/admin/components/ui/enrollment-course-select.vue";
import { SCORE_LIMIT } from "@/modules/admin/constants/numeric-limits";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import finalGradeService from "../services/final-grade.service";
import type { FinalGradeBodyDTO } from "../dto/final-grade.dto";

const route = useRoute();
const identifier = ref<string>(String(route.params.id));

const initialValues = ref<FinalGradeBodyDTO>({
  enrollment_course_id: null,
  final_score: null,
  approved: false,
  calculated_at: null,
});

const formSchema = z.object({
  enrollment_course_id: z.number({
    message: "Selecciona el curso de la matrícula",
  }),
  final_score: z
    .number()
    .min(SCORE_LIMIT.min, { message: "No puede ser negativa" })
    .max(SCORE_LIMIT.max, { message: "Valor demasiado alto" })
    .nullable()
    .optional(),
  approved: z.boolean(),
  calculated_at: z.string().nullable().optional(),
});

onMounted(async () => {
  const loadingStore = useLoadingStore();
  loadingStore.start();
  const resp = await finalGradeService.edit(identifier.value);
  loadingStore.finish();
  if (!resp) return;

  initialValues.value = {
    enrollment_course_id: resp.enrollmentCourseId,
    final_score: resp.finalScore,
    approved: resp.approved,
    calculated_at: resp.calculatedAt,
  };
});
</script>

<template>
  <CrudForm
    title="Actualizar nota final"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="finalGrades.list"
    :service="(body) => finalGradeService.update(identifier, body)"
    submit-label="Actualizar"
  >
    <template #default="{ fields, errors }">
      <EnrollmentCourseSelect
        v-model="fields.enrollment_course_id.value"
        :invalid="!!errors.enrollment_course_id"
        :message-error="errors.enrollment_course_id"
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputNumberCore
          v-model="fields.final_score.value"
          label="Nota final"
          :min="SCORE_LIMIT.min"
          :max="SCORE_LIMIT.max"
          :min-fraction-digits="0"
          :max-fraction-digits="2"
          :invalid="!!errors.final_score"
          :message-error="errors.final_score"
        />
        <DatePicketCore
          v-model="fields.calculated_at.value"
          label="Calculado el"
          dayjs-format-value="YYYY-MM-DD"
          :invalid="!!errors.calculated_at"
          :message-error="errors.calculated_at"
        />
      </div>

      <div>
        <LabelCore
          text="Aprobado"
          required
          hint="Determina si el alumno superó el curso."
        />
        <ToggleCore v-model="fields.approved.value" />
      </div>
    </template>
  </CrudForm>
</template>