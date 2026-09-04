<script setup lang="ts">
import { z } from "zod";
import { ref } from "vue";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore } from "@/shared/components";
import { slugify } from "@/shared/utils/format";
import tagService from "../services/tag.service";
import type { TagBodyDTO } from "../dto/tag.dto";

const initialValues = ref<TagBodyDTO>({
  name: null,
  slug: null,
});

/**
 * El slug se sugiere desde el nombre mientras no se edite a mano, como
 * indica el diseño ("se genera automáticamente del nombre; editable").
 */
const slugTouched = ref<boolean>(false);

const formSchema = z.object({
  name: z
    .string({ message: "El nombre es obligatorio" })
    .min(2, { message: "Debe tener al menos 2 caracteres" })
    .max(100, { message: "No puede tener más de 100 caracteres" }),
  slug: z
    .string({ message: "El slug es obligatorio" })
    .min(2, { message: "Debe tener al menos 2 caracteres" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Solo minúsculas, números y guiones",
    }),
});
</script>

<template>
  <CrudForm
    title="Crear etiqueta"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="tags.list"
    :service="(body) => tagService.create(body)"
  >
    <template #default="{ fields, errors }">
      <InputTextCore
        v-model="fields.name.value"
        label="Nombre"
        :invalid="!!errors.name"
        :message-error="errors.name"
        @update:model-value="
          !slugTouched && (fields.slug.value = slugify(fields.name.value ?? ''))
        "
      />
      <InputTextCore
        v-model="fields.slug.value"
        label="Slug"
        :invalid="!!errors.slug"
        :message-error="errors.slug"
        messages-info="Se genera automáticamente del nombre; editable."
        @input="slugTouched = true"
      />
    </template>
  </CrudForm>
</template>
