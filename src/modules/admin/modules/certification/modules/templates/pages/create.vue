<script setup lang="ts">
import { z } from "zod";
import { ref } from "vue";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore } from "@/shared/components";
import ImageField from "@/modules/admin/components/ui/image-field.vue";
import templateService from "../services/template.service";
import type { CertificateTemplateBodyDTO } from "../dto/template.dto";

const initialValues = ref<CertificateTemplateBodyDTO>({
  name: null,
  font_family: null,
});

const backgroundImage = ref<File | null>(null);
const signatureImage = ref<File | null>(null);
const currentBackground = ref<string | null>(null);
const currentSignature = ref<string | null>(null);

const backgroundHint = "JPG, PNG o WEBP.";
const signatureHint = "PNG con fondo transparente.";

const formSchema = z.object({
  name: z
    .string({ message: "El nombre es obligatorio" })
    .min(3, { message: "Debe tener al menos 3 caracteres" })
    .max(255, { message: "No puede tener más de 255 caracteres" }),
  font_family: z
    .string({ message: "La tipografía es obligatoria" })
    .max(255, { message: "No puede tener más de 255 caracteres" }),
});
</script>

<template>
  <CrudForm
    title="Crear plantilla"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="certificateTemplates.list"
    :service="
      (body) =>
        templateService.create({
          ...body,
          background_image: backgroundImage,
          signature_image: signatureImage,
        })
    "
  >
    <template #default="{ fields, errors }">
      <InputTextCore
        v-model="fields.name.value"
        label="Nombre"
        required
        :invalid="!!errors.name"
        :message-error="errors.name"
      />

      <InputTextCore
        v-model="fields.font_family.value"
        label="Tipografía"
        required
        hint-label="Ej: Bricolage Grotesque, Inter Tight."
        :invalid="!!errors.font_family"
        :message-error="errors.font_family"
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ImageField
          label="Imagen de fondo"
          :hint="backgroundHint"
          accept="image/jpeg,image/png,image/webp"
          :current="currentBackground"
          @select="(file) => (backgroundImage = file)"
        />
        <ImageField
          label="Imagen de firma"
          :hint="signatureHint"
          accept="image/jpeg,image/png,image/webp"
          :current="currentSignature"
          @select="(file) => (signatureImage = file)"
        />
      </div>
    </template>
  </CrudForm>
</template>
