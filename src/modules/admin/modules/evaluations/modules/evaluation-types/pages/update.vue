<script setup lang="ts">
import { z } from "zod";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore, TextAreaCore } from "@/shared/components";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import evaluationTypeService from "../services/evaluation-type.service";
import type { EvaluationTypeBodyDTO } from "../dto/evaluation-type.dto";

const route = useRoute();
const identifier = ref<string>(String(route.params.id));

const initialValues = ref<EvaluationTypeBodyDTO>({
  name: null,
  description: null,
});

const formSchema = z.object({
  name: z
    .string({ message: "El nombre es obligatorio" })
    .min(3, { message: "Debe tener al menos 3 caracteres" })
    .max(100, { message: "No puede tener más de 100 caracteres" }),
  description: z.string().nullable().optional(),
});

onMounted(async () => {
  const loadingStore = useLoadingStore();
  loadingStore.start();
  const resp = await evaluationTypeService.edit(identifier.value);
  loadingStore.finish();
  if (!resp) return;

  initialValues.value = {
    name: resp.name,
    description: resp.description,
  };
});
</script>

<template>
  <CrudForm
    title="Actualizar Tipo de evaluación"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="evaluationTypes.list"
    :service="(body) => evaluationTypeService.update(identifier, body)"
    submit-label="Actualizar"
  >
    <template #default="{ fields, errors }">
      <InputTextCore
        v-model="fields.name.value"
        label="Nombre"
        :invalid="!!errors.name"
        :message-error="errors.name"
        messages-info="Ej: Examen, Práctica, Proyecto"
      />
      <TextAreaCore
        v-model="fields.description.value"
        label="Descripción"
        :rows="3"
        :invalid="!!errors.description"
        :message-error="errors.description"
      />
    </template>
  </CrudForm>
</template>
