<script setup lang="ts">
import { z } from "zod";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import {
  InputTextCore,
  TextAreaCore,
  DatePicketCore,
} from "@/shared/components";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import jobOfferService from "../services/job-offer.service";
import type { JobOfferBodyDTO } from "../dto/job-offer.dto";

const route = useRoute();
const identifier = ref<string>(String(route.params.id));

const initialValues = ref<JobOfferBodyDTO>({
  title: null,
  company: null,
  location: null,
  url: null,
  source: null,
  description: null,
  salary: null,
  employment_type: null,
  posted_at: null,
});

const formSchema = z.object({
  title: z
    .string({ message: "El puesto es obligatorio" })
    .min(3, { message: "Debe tener al menos 3 caracteres" })
    .max(255, { message: "No puede tener más de 255 caracteres" }),
  company: z.string().max(255).nullable().optional(),
  location: z.string().max(255).nullable().optional(),
  url: z
    .string()
    .url({ message: "Debe ser una URL válida" })
    .max(255)
    .nullable()
    .optional(),
  source: z.string().max(255).nullable().optional(),
  description: z.string().nullable().optional(),
  salary: z.string().max(255).nullable().optional(),
  employment_type: z.string().max(255).nullable().optional(),
  posted_at: z.string().nullable().optional(),
});

onMounted(async () => {
  if (!route.params.id) return;

  const loadingStore = useLoadingStore();
  loadingStore.start();
  const resp = await jobOfferService.edit(identifier.value);
  loadingStore.finish();
  if (!resp) return;

  initialValues.value = {
    title: resp.title,
    company: resp.company,
    location: resp.location,
    url: resp.url,
    source: resp.source,
    description: resp.description,
    salary: resp.salary,
    employment_type: resp.employmentType,
    posted_at: resp.postedAt,
  };
});
</script>

<template>
  <CrudForm
    title="Actualizar oferta"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="jobOffers.list"
    :service="(body) => jobOfferService.update(identifier, body)"
    submit-label="Actualizar"
  >
    <template #default="{ fields, errors }">
      <InputTextCore
        v-model="fields.title.value"
        label="Puesto"
        required
        :invalid="!!errors.title"
        :message-error="errors.title"
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputTextCore
          v-model="fields.company.value"
          label="Empresa"
          :invalid="!!errors.company"
          :message-error="errors.company"
        />
        <InputTextCore
          v-model="fields.location.value"
          label="Ubicación"
          :invalid="!!errors.location"
          :message-error="errors.location"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputTextCore
          v-model="fields.source.value"
          label="Fuente"
          hint-label="De dónde viene la oferta."
          :invalid="!!errors.source"
          :message-error="errors.source"
        />
        <DatePicketCore
          v-model="fields.posted_at.value"
          label="Publicado"
          dayjs-format-value="YYYY-MM-DD"
          :invalid="!!errors.posted_at"
          :message-error="errors.posted_at"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputTextCore
          v-model="fields.salary.value"
          label="Salario"
          :invalid="!!errors.salary"
          :message-error="errors.salary"
        />
        <InputTextCore
          v-model="fields.employment_type.value"
          label="Tipo de empleo"
          hint-label="Ej: Tiempo completo, Prácticas."
          :invalid="!!errors.employment_type"
          :message-error="errors.employment_type"
        />
      </div>

      <InputTextCore
        v-model="fields.url.value"
        label="Enlace a la oferta"
        :invalid="!!errors.url"
        :message-error="errors.url"
      />

      <TextAreaCore
        v-model="fields.description.value"
        label="Descripción"
        :rows="4"
        :invalid="!!errors.description"
        :message-error="errors.description"
      />
    </template>
  </CrudForm>
</template>
