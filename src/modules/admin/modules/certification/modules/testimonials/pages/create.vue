<script setup lang="ts">
import { z } from "zod";
import { ref } from "vue";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { TextAreaCore, InputNumberCore } from "@/shared/components";
import EnrollmentCourseSelect from "@/modules/admin/components/ui/enrollment-course-select.vue";
import testimonialService from "../services/testimonial.service";
import type { TestimonialBodyDTO } from "../dto/testimonial.dto";

const initialValues = ref<TestimonialBodyDTO>({
  enrollment_course_id: null,
  rating: null,
  body: null,
});

const formSchema = z.object({
  enrollment_course_id: z.number({
    message: "Selecciona el curso de la matrícula",
  }),
  rating: z
    .number({ message: "Ingresa la calificación" })
    .min(0.5, { message: "Mínimo 0.5 estrellas" })
    .max(5, { message: "Máximo 5 estrellas" }),
  body: z
    .string({ message: "Ingresa el texto del testimonio" })
    .min(1, { message: "Ingresa el texto del testimonio" })
    .max(2000, { message: "Máximo 2000 caracteres" }),
});
</script>

<template>
  <CrudForm
    title="Crear testimonio"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="testimonials.list"
    :service="(body) => testimonialService.create(body)"
  >
    <template #default="{ fields, errors }">
      <!--
        ⚠️ Solo curso puntual: no hay todavía un selector de línea de carrera
        (`enrollment_item_id`) en el panel, mismo estado que Certificados.
      -->
      <EnrollmentCourseSelect
        v-model="fields.enrollment_course_id.value"
        :invalid="!!errors.enrollment_course_id"
        :message-error="errors.enrollment_course_id"
      />

      <InputNumberCore
        v-model="fields.rating.value"
        label="Calificación"
        required
        :min="0.5"
        :max="5"
        :step="0.5"
        :min-fraction-digits="1"
        :max-fraction-digits="1"
        hint-label="Admite medias estrellas (ej. 3.5)."
        :invalid="!!errors.rating"
        :message-error="errors.rating"
      />

      <TextAreaCore
        v-model="fields.body.value"
        label="Testimonio"
        required
        :rows="5"
        :invalid="!!errors.body"
        :message-error="errors.body"
      />
    </template>
  </CrudForm>
</template>
