<script setup lang="ts">
import { z } from "zod";
import { ref } from "vue";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import {
  InputNumberCore,
  SelectCore,
  TextAreaCore,
  DatePicketCore,
} from "@/shared/components";
import EnrollmentCourseSelect from "@/modules/admin/components/ui/enrollment-course-select.vue";
import { SCORE_LIMIT } from "@/modules/admin/constants/numeric-limits";
import studentEvaluationService from "../services/student-evaluation.service";
import courseEvaluationService from "../../course-evaluations/services/course-evaluation.service";
import type { StudentEvaluationBodyDTO } from "../dto/student-evaluation.dto";

const initialValues = ref<StudentEvaluationBodyDTO>({
  enrollment_course_id: null,
  course_evaluation_id: null,
  score: null,
  feedback: null,
  evaluated_at: null,
});

const formSchema = z.object({
  enrollment_course_id: z.number({
    message: "Selecciona el curso de la matrícula",
  }),
  course_evaluation_id: z.number({ message: "Selecciona la evaluación" }),
  score: z
    .number()
    .min(SCORE_LIMIT.min, { message: "No puede ser negativa" })
    .max(SCORE_LIMIT.max, { message: "Valor demasiado alto" })
    .nullable()
    .optional(),
  feedback: z.string().nullable().optional(),
  evaluated_at: z.string().nullable().optional(),
});
</script>

<template>
  <CrudForm
    title="Registrar nota"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="studentEvaluations.list"
    :service="(body) => studentEvaluationService.create(body)"
  >
    <template #default="{ fields, errors }">
      <EnrollmentCourseSelect
        v-model="fields.enrollment_course_id.value"
        :invalid="!!errors.enrollment_course_id"
        :message-error="errors.enrollment_course_id"
      />

      <SelectCore
        v-model="fields.course_evaluation_id.value"
        label="Evaluación"
        required
        filter
        option-label="name"
        option-value="id"
        placeholder="Selecciona una evaluación"
        :service="() => courseEvaluationService.all()"
        auto-load
        :invalid="!!errors.course_evaluation_id"
        :message-error="errors.course_evaluation_id"
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputNumberCore
          v-model="fields.score.value"
          label="Nota"
          :min="SCORE_LIMIT.min"
          :max="SCORE_LIMIT.max"
          :min-fraction-digits="0"
          :max-fraction-digits="2"
          :invalid="!!errors.score"
          :message-error="errors.score"
        />
        <DatePicketCore
          v-model="fields.evaluated_at.value"
          label="Evaluado el"
          dayjs-format-value="YYYY-MM-DD"
          :invalid="!!errors.evaluated_at"
          :message-error="errors.evaluated_at"
        />
      </div>

      <TextAreaCore
        v-model="fields.feedback.value"
        label="Retroalimentación"
        :rows="3"
        :invalid="!!errors.feedback"
        :message-error="errors.feedback"
      />
    </template>
  </CrudForm>
</template>
