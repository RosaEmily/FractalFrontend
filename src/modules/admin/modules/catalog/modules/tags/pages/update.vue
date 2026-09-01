<script setup lang="ts">
import { z } from "zod";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore } from "@/shared/components";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import tagService from "../services/tag.service";
import type { TagBodyDTO } from "../dto/tag.dto";

const route = useRoute();
const identifier = ref<string>(String(route.params.id));

const initialValues = ref<TagBodyDTO>({
  name: null,
  slug: null,
});

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

onMounted(async () => {
  const loadingStore = useLoadingStore();
  loadingStore.start();
  const resp = await tagService.edit(identifier.value);
  loadingStore.finish();
  if (!resp) return;

  initialValues.value = {
    name: resp.name,
    slug: resp.slug,
  };
});
</script>

<template>
  <CrudForm
    title="Actualizar etiqueta"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="tags.list"
    :service="(body) => tagService.update(identifier, body)"
    submit-label="Actualizar"
  >
    <template #default="{ fields, errors }">
      <InputTextCore
        v-model="fields.name.value"
        label="Nombre"
        :invalid="!!errors.name"
        :message-error="errors.name"
      />
      <!--
        Al editar el slug no se regenera solo: cambiarlo rompe los enlaces
        de la landing que ya lo usan.
      -->
      <InputTextCore
        v-model="fields.slug.value"
        label="Slug"
        :invalid="!!errors.slug"
        :message-error="errors.slug"
        messages-info="Cambiarlo afecta los enlaces existentes de la landing."
      />
    </template>
  </CrudForm>
</template>
