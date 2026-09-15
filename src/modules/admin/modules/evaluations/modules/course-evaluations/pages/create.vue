<script setup lang="ts">
import { z } from "zod";
import { ref } from "vue";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore, InputNumberCore, SelectCore } from "@/shared/components";
import OfferCourseSelect from "@/modules/admin/components/ui/offer-course-select.vue";
import {
  WEIGHT_LIMIT,
  SCORE_LIMIT,
} from "@/modules/admin/constants/numeric-limits";
import courseEvaluationService from "../services/course-evaluation.service";
import evaluationTypeService from "../../evaluation-types/services/evaluation-type.service";
import type { CourseEvaluationBodyDTO } from "../dto/course-evaluation.dto";

const initialValues = ref<CourseEvaluationBodyDTO>({
  offer_course_id: null,
  evaluation_type_id: null,
  name: null,
  weight: null,
  max_score: null,
});

const formSchema = z.object({
  offer_course_id: z.number({ message: "Selecciona el curso del programa" }),
  evaluation_type_id: z.number({ message: "Selecciona el tipo de evaluación" }),
  name: z
    .string({ message: "El nombre es obligatorio" })
    .min(3, { message: "Debe tener al menos 3 caracteres" })
    .max(100, { message: "No puede tener más de 100 caracteres" }),
  weight: z
    .number({ message: "El peso es obligatorio" })
    .min(WEIGHT_LIMIT.min, { message: "No puede ser negativo" })
    .max(WEIGHT_LIMIT.max, { message: "El peso no puede superar 100%" }),
  max_score: z
    .number({ message: "La nota máxima es obligatoria" })
    .min(SCORE_LIMIT.min, { message: "No puede ser negativa" })
    .max(SCORE_LIMIT.max, { message: "Valor demasiado alto" }),
});
</script>

<template>
  <CrudForm
    title="Crear evaluación"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="courseEvaluations.list"
    :service="(body) => courseEvaluationService.create(body)"
  >
    <template #default="{ fields, errors }">
      <OfferCourseSelect
        v-model="fields.offer_course_id.value"
        :invalid="!!errors.offer_course_id"
        :message-error="errors.offer_course_id"
      />

      <InputTextCore
        v-model="fields.name.value"
        label="Nombre de la evaluación"
        required
        hint-label="Ej: Examen parcial, Proyecto final."
        :invalid="!!errors.name"
        :message-error="errors.name"
      />

      <SelectCore
        v-model="fields.evaluation_type_id.value"
        label="Tipo de evaluación"
        required
        option-label="name"
        option-value="id"
        placeholder="Selecciona un tipo"
        :service="() => evaluationTypeService.all()"
        auto-load
        :invalid="!!errors.evaluation_type_id"
        :message-error="errors.evaluation_type_id"
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputNumberCore
          v-model="fields.weight.value"
          label="Peso (%)"
          required
          hint-label="La suma de los pesos del curso debe dar 100."
          :min="WEIGHT_LIMIT.min"
          :max="WEIGHT_LIMIT.max"
          :min-fraction-digits="0"
          :max-fraction-digits="2"
          :invalid="!!errors.weight"
          :message-error="errors.weight"
        />
        <InputNumberCore
          v-model="fields.max_score.value"
          label="Nota máxima"
          required
          :min="SCORE_LIMIT.min"
          :max="SCORE_LIMIT.max"
          :min-fraction-digits="0"
          :max-fraction-digits="2"
          :invalid="!!errors.max_score"
          :message-error="errors.max_score"
        />
      </div>
    </template>
  </CrudForm>
</template>
