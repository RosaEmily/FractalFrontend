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

const route = useRoute();

/*
 * El nombre es del catálogo del backend y no se edita: se muestra para saber
 * qué permiso es, pero no forma parte del formulario ni se envía.
 */
const permissionName = ref<string>("");

const initialValues = ref<Pick<PermissionCreateBodyDTO, "description">>({
  description: null,
});

const identifier = ref<string>(route.params.id);

const formSchema = z.object({
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

const loadingData = ref<boolean>(true);

onMounted(async () => {
  const resp = await permissionService.edit(identifier.value);
  loadingData.value = false;
  if (!resp) return;
  permissionName.value = resp.name;
  initialValues.value = {
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
    :loading-data="loadingData"
    :skeleton-fields="1"
    skeleton-textarea
  >
    <template #default="{ fields, errors }">
      <InputTextCore :model-value="permissionName" label="Nombre" disabled />
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
