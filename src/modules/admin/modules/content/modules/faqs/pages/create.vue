<script setup lang="ts">
import { z } from "zod";
import { ref } from "vue";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore, TextAreaCore } from "@/shared/components";
import FieldPreview from "../../../components/field-preview.vue";
import FaqPreview from "../components/faq-preview.vue";
import faqService from "../services/faq.service";
import type { FaqBodyDTO } from "../dto/faq.dto";

const initialValues = ref<FaqBodyDTO>({
  question: null,
  answer: null,
});

const formSchema = z.object({
  question: z
    .string({ message: "La pregunta es obligatoria" })
    .min(6, { message: "Debe tener al menos 6 caracteres" })
    .max(255, { message: "No puede tener más de 255 caracteres" }),
  answer: z
    .string({ message: "La respuesta es obligatoria" })
    .min(6, { message: "Debe tener al menos 6 caracteres" }),
});
</script>

<template>
  <CrudForm
    title="Crear FAQ"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="faqs.list"
    :service="(body) => faqService.create(body)"
  >
    <template #default="{ fields, errors }">
      <InputTextCore
        v-model="fields.question.value"
        label="Pregunta"
        :invalid="!!errors.question"
        :message-error="errors.question"
      />
      <TextAreaCore
        v-model="fields.answer.value"
        label="Respuesta"
        :rows="5"
        :invalid="!!errors.answer"
        :message-error="errors.answer"
      />

      <FieldPreview hint="así se ve en Contacto → Preguntas frecuentes">
        <FaqPreview :question="fields.question.value" :answer="fields.answer.value" />
      </FieldPreview>
    </template>
  </CrudForm>
</template>
