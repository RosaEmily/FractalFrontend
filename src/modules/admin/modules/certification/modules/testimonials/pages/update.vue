<script setup lang="ts">
import { z } from "zod";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { TextAreaCore, InputNumberCore } from "@/shared/components";
import ToggleCheck from "@/modules/admin/components/ui/toggle-check.vue";
import testimonialService from "../services/testimonial.service";
import type { TestimonialUpdateBodyDTO } from "../dto/testimonial.dto";

const route = useRoute();
const identifier = ref<string>(String(route.params.id));

const initialValues = ref<TestimonialUpdateBodyDTO>({
  rating: undefined,
  body: undefined,
  is_featured: undefined,
});

/** Solo lectura: quién y de qué es, para dar contexto al curar. */
const subjectLabel = ref<string>("");
const studentLabel = ref<string>("");

const formSchema = z.object({
  rating: z
    .number({ message: "Ingresa la calificación" })
    .min(0.5, { message: "Mínimo 0.5 estrellas" })
    .max(5, { message: "Máximo 5 estrellas" }),
  body: z
    .string({ message: "Ingresa el texto del testimonio" })
    .min(1, { message: "Ingresa el texto del testimonio" })
    .max(2000, { message: "Máximo 2000 caracteres" }),
  is_featured: z.boolean().optional(),
});

const loadingData = ref<boolean>(true);

onMounted(async () => {
  const resp = await testimonialService.edit(identifier.value);
  loadingData.value = false;
  if (!resp) return;

  initialValues.value = {
    rating: resp.rating,
    body: resp.body,
    is_featured: resp.isFeatured,
  };

  studentLabel.value = resp.studentName
    ? `${resp.studentName} · ${resp.studentDocument ?? ""}`
    : "—";
  subjectLabel.value = `${resp.subjectTypeLabel}: ${resp.subjectName ?? "—"}`;
});
</script>

<template>
  <CrudForm
    title="Actualizar testimonio"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="testimonials.list"
    :service="(body) => testimonialService.update(identifier, body)"
    :loading-data="loadingData"
    :skeleton-fields="3"
    submit-label="Actualizar"
  >
    <template #default="{ fields, errors }">
      <!--
        De quién y de qué es: solo lectura, no se reasigna desde la edición
        (el backend ni siquiera acepta los FKs en el UpdateRequest).
      -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
        <p class="text-adm-sm text-secondary-500">
          <span class="block text-adm-xs text-secondary-400 uppercase">
            Alumno
          </span>
          {{ studentLabel }}
        </p>
        <p class="text-adm-sm text-secondary-500">
          <span class="block text-adm-xs text-secondary-400 uppercase">
            Curso / Línea
          </span>
          {{ subjectLabel }}
        </p>
      </div>

      <InputNumberCore
        v-model="fields.rating!.value"
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
        v-model="fields.body!.value"
        label="Testimonio"
        required
        :rows="5"
        :invalid="!!errors.body"
        :message-error="errors.body"
      />

      <ToggleCheck
        :on="!!fields.is_featured?.value"
        label="Destacado en la landing"
        hint="Solo los testimonios destacados aparecen en la web pública."
        @toggle="fields.is_featured && (fields.is_featured.value = $event)"
      />
    </template>
  </CrudForm>
</template>
