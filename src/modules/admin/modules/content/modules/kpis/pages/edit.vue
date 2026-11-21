<script setup lang="ts">
import { z } from "zod";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore, InputNumberCore } from "@/shared/components";
import FieldPreview from "../../../components/field-preview.vue";
import KpiPreview from "../components/kpi-preview.vue";
import kpiService from "../services/kpi.service";
import type { KpiBodyDTO } from "../dto/kpi.dto";

const route = useRoute();

/** Los ids del JSON de landing son string. */
const identifier = ref<string>(String(route.params.id));

const initialValues = ref<KpiBodyDTO>({
  description: null,
  number: null,
  format: null,
});

const formSchema = z.object({
  description: z
    .string({ message: "La descripción es obligatoria" })
    .min(4, { message: "Debe tener al menos 4 caracteres" })
    .max(255, { message: "No puede tener más de 255 caracteres" }),
  number: z
    .number({ message: "El valor es obligatorio" })
    .min(0, { message: "No puede ser negativo" })
    .max(999999999, { message: "Valor demasiado alto" }),
  format: z
    .string({ message: "El formato es obligatorio" })
    .max(20, { message: "No puede tener más de 20 caracteres" })
    .refine((value) => value.includes("{n}"), {
      message: "El formato debe incluir {n}, que se reemplaza por el valor",
    }),
});

const loadingData = ref<boolean>(true);

onMounted(async () => {
  const resp = await kpiService.edit(identifier.value);
  loadingData.value = false;
  if (!resp) return;

  initialValues.value = {
    description: resp.description,
    number: resp.number,
    format: resp.format,
  };
});
</script>

<template>
  <CrudForm
    title="Actualizar KPI"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="kpis.list"
    :service="(body) => kpiService.update(identifier, body)"
    :loading-data="loadingData"
    :skeleton-fields="3"
    submit-label="Actualizar"
  >
    <template #default="{ fields, errors }">
      <InputTextCore
        v-model="fields.description.value"
        label="Descripción"
        :invalid="!!errors.description"
        :message-error="errors.description"
      />
      <InputNumberCore
        v-model="fields.number.value"
        label="Valor"
        :invalid="!!errors.number"
        :message-error="errors.number"
      />
      <InputTextCore
        v-model="fields.format.value"
        label="Formato"
        :invalid="!!errors.format"
        :message-error="errors.format"
        messages-info='{n} se reemplaza por el número. Ej: "+{n}%", "{n}+", "S/ {n}"'
      />

      <FieldPreview hint="así se ve en el home">
        <KpiPreview
          :number="fields.number.value"
          :format="fields.format.value"
          :description="fields.description.value"
        />
      </FieldPreview>
    </template>
  </CrudForm>
</template>
