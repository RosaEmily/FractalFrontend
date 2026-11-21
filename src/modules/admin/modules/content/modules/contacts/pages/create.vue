<script setup lang="ts">
import { z } from "zod";
import { STRING_REGEX } from "@/shared/constants/zod";
import { ref } from "vue";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import {
  InputTextCore,
  SelectCore,
  ToggleCore,
  LabelCore,
} from "@/shared/components";
import FieldPreview from "../../../components/field-preview.vue";
import FooterPreview from "../../../components/footer-preview.vue";
import ContactIntroPreview from "../../../components/contact-intro-preview.vue";
import contactService from "../services/contact.service";
import { CONTACT_TYPE_OPTIONS } from "../constants/contact.constant";
import type { ContactBodyDTO } from "../dto/contact.dto";

const initialValues = ref<ContactBodyDTO>({
  description: null,
  type: null,
  value: null,
  isFavorite: false,
});

const formSchema = z.object({
  description: z
    .string({ message: "La descripción es obligatoria" })
    .min(3, { message: "Debe tener al menos 3 caracteres" })
    .max(255, { message: "No puede tener más de 255 caracteres" }),
  type: z.enum(["email", "mobile", "phone", "address", "other"], {
    message: "Debes seleccionar un tipo",
  }),
  value: z
    .string({ message: "El valor es obligatorio" })
    .min(3, { message: "Debe tener al menos 3 caracteres" })
    .max(255, { message: "No puede tener más de 255 caracteres" }),
  isFavorite: z.boolean(),
}).superRefine((data, ctx) => {
  if (data.type === "email" && !STRING_REGEX.emailSimple.test(data.value)) {
    ctx.addIssue({ code: "custom", path: ["value"], message: "Debe ser un correo válido" });
  }
  if (
    (data.type === "mobile" || data.type === "phone") &&
    !STRING_REGEX.phoneSimple.test(data.value)
  ) {
    ctx.addIssue({ code: "custom", path: ["value"], message: "Debe ser un teléfono válido" });
  }
});
</script>

<template>
  <CrudForm
    title="Crear contacto"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="contacts.list"
    :service="(body) => contactService.create(body)"
  >
    <template #default="{ fields, errors }">
      <InputTextCore
        v-model="fields.description.value"
        label="Descripción"
        required
        placeholder="Correo electrónico general"
        :invalid="!!errors.description"
        :message-error="errors.description"
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectCore
          v-model="fields.type.value"
          label="Tipo"
          required
          :options="CONTACT_TYPE_OPTIONS"
          option-label="label"
          option-value="value"
          placeholder="Selecciona un tipo"
          :invalid="!!errors.type"
          :message-error="errors.type"
        />
        <InputTextCore
          v-model="fields.value.value"
          label="Valor"
          required
          :invalid="!!errors.value"
          :message-error="errors.value"
        />
      </div>

      <FieldPreview label="Pie de página" hint="así se ve al pie de la web">
        <FooterPreview :contact="{ type: fields.type.value as string | null, value: fields.value.value as string | null }" />
      </FieldPreview>
      <FieldPreview label="Página de Contacto" hint="así se ve en las tarjetas de contacto">
        <ContactIntroPreview :contact="{ type: fields.type.value as string | null, value: fields.value.value as string | null }" />
      </FieldPreview>

      <div>
        <LabelCore
          text="Destacado"
          hint="Aparece primero en el pie de página."
        />
        <ToggleCore v-model="fields.isFavorite.value" />
      </div>
    </template>
  </CrudForm>
</template>
