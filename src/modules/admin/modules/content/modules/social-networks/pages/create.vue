<script setup lang="ts">
import { z } from "zod";
import { ref } from "vue";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore } from "@/shared/components";
import FieldPreview from "../../../components/field-preview.vue";
import socialNetworkService from "../services/social-network.service";
import type { SocialNetworkBodyDTO } from "../dto/social-network.dto";

const initialValues = ref<SocialNetworkBodyDTO>({
  name: null,
  url: null,
});

const formSchema = z.object({
  name: z
    .string({ message: "El nombre es obligatorio" })
    .max(50, { message: "No puede tener más de 50 caracteres" }),
  url: z
    .string({ message: "El enlace es obligatorio" })
    .url({ message: "Debe ser una URL válida" })
    .max(255, { message: "No puede tener más de 255 caracteres" }),
});
</script>

<template>
  <CrudForm
    title="Crear Red social"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="socialNetworks.list"
    :service="(body) => socialNetworkService.create(body)"
  >
    <template #default="{ fields, errors }">
      <InputTextCore
        v-model="fields.name.value"
        label="Plataforma"
        :invalid="!!errors.name"
        :message-error="errors.name"
        messages-info="Ej: facebook, instagram, linkedin. Máx. 50 caracteres."
      />
      <InputTextCore
        v-model="fields.url.value"
        label="URL"
        :invalid="!!errors.url"
        :message-error="errors.url"
        messages-info="URL válida, máx. 255 caracteres."
      />

      <FieldPreview hint="Así se ve en el pie de página.">
        <a
          v-if="fields.url.value"
          :href="fields.url.value"
          target="_blank"
          rel="noopener noreferrer"
          class="text-adm-base text-primary-500 underline"
        >
          {{ fields.name.value || fields.url.value }}
        </a>
        <span v-else class="text-adm-base text-secondary-400">—</span>
      </FieldPreview>
    </template>
  </CrudForm>
</template>
