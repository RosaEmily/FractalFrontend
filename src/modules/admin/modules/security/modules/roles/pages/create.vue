<script setup lang="ts">
import { z } from "zod";
import {
  InputTextCore,
  TextAreaCore,
  MultiselectCore,
} from "@/shared/components";
import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { FilterMatchMode } from "@primevue/core";

import { withRefinements } from "@/shared/utils/zod/withRefinements";
import { lettersSpaces } from "@/shared/utils/zod/shortcuts";
import roleService from "../services/role.service";
import permissionService from "../../permissions/services/permission.service";

const initialValues = {
  name: null,
  description: null,
  permissions: [],
};

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
  permissions: z
    .array(
      z.number({
        invalid_type_error: "Cada permiso debe ser un número",
      }),
    )
    .min(1, { message: "Debe seleccionar al menos un permiso" })
    .optional(),
});
</script>
<template>
  <CrudForm
    title="Crear Rol"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="roles.list"
    :service="(body) => roleService.create(body)"
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
      <MultiselectCore
        v-model="fields.permissions.value"
        label="Permisos"
        filter
        optionLabel="name"
        optionValue="id"
        placeholder="Seleccione los permisos"
        autoLoad
        :service="
          () =>
            permissionService.all({
              filters: {
                status: { value: 1, matchMode: FilterMatchMode.EQUALS },
              },
            })
        "
      />
    </template>
  </CrudForm>
</template>
