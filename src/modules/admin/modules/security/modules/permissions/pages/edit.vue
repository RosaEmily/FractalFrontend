<script setup lang="ts">
import { z } from "zod";
import { onMounted, ref } from "vue";

import { useRoute } from "vue-router";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { withRefinements } from "@/shared/utils/zod/withRefinements";
import { lettersSpaces } from "@/shared/utils/zod/shortcuts";
import { InputTextCore, TextAreaCore } from "@/shared/components";
import type { PermissionCreateBodyDTO } from "../dto/permission.dto";

import permissionService from "../services/permission.service";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";

const route = useRoute();

const initialValues = ref<PermissionCreateBodyDTO>({
  name: null,
  description: null,
});

const identifier = ref<string>(route.params.id);

const formSchema = z.object({
  name: withRefinements(
    z
      .string({
        message: "El campo nombre es obligatorio",
      })
      .min(4, { message: "Debe tener al menos 4 caracteres" })
      .max(200, { message: "No puede tener más de 200 caracteres" })
      .regex(/^[A-Z](?:[A-Z_]*[A-Z])?$/, {
        message:
          "Solo letras mayúsculas y guion bajo, sin empezar ni terminar en _",
      }),
  ),
  description: withRefinements(
    z
      .string({
        message: "El campo descripción es obligatorio",
      })
      .min(6, { message: "Debe tener al menos 6 caracteres" })
      .max(200, { message: "No puede tener más de 200 caracteres" }),
    lettersSpaces,
  ),
});

onMounted(async () => {
  const landingStore = useLoadingStore();
  landingStore.start();
  const resp = await permissionService.edit(identifier.value);
  landingStore.finish();
  if (!resp) return;
  initialValues.value = {
    name: resp.name,
    description: resp.description,
  };
});
</script>
<template>
  <CrudForm
    title="Actualizar Permiso"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="permissions.list"
    :service="(body) => permissionService.update(identifier, body)"
    submit-label="Actualizar"
  >
    <template #default="{ fields, errors }">
      <InputTextCore
        v-model="fields.name.value"
        label="Nombre"
        :invalid="!!errors.name"
        :message-error="errors.name"
        v-keyfilter="/^[A-Za-z_]+$/"
      />
      <TextAreaCore
        v-model="fields.description.value"
        label="Descripción"
        :invalid="!!errors.description"
        :message-error="errors.description"
        v-keyfilter.lettersSpaces
      />
    </template>
  </CrudForm>
</template>
