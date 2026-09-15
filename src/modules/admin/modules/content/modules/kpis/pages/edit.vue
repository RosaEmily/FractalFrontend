<script setup lang="ts">
import { z } from "zod";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore, InputNumberCore } from "@/shared/components";
import FieldPreview from "../../../components/field-preview.vue";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
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
  number: z.number({ message: "El valor es obligatorio" }),
  format: z
    .string({ message: "El formato es obligatorio" })
    .max(20, { message: "No puede tener más de 20 caracteres" })
    .refine((value) => value.includes("{n}"), {
      message: "El formato debe incluir {n}, que se reemplaza por el valor",
    }),
});

onMounted(async () => {
  const loadingStore = useLoadingStore();
  loadingStore.start();
  const resp = await kpiService.edit(identifier.value);
  loadingStore.finish();
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

      <FieldPreview hint="Así se ve en el home.">
        <span class="font-display text-2xl font-bold text-primary-500">
          {{
            (fields.format.value ?? "").replace(
              "{n}",
              String(fields.number.value ?? ""),
            ) || "—"
          }}
        </span>
      </FieldPreview>
    </template>
  </CrudForm>
</template>
