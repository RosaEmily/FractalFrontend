<script setup lang="ts">
import { z } from "zod";
import { ref } from "vue";
import {
  InputTextCore,
  InputNumberCore,
  TextAreaCore,
  SelectCore,
  MultiselectCore,
} from "@/shared/components";
import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import ImageField from "@/modules/admin/components/ui/image-field.vue";
import { FilterMatchMode } from "@primevue/core";

import learningPathService, {
  toCourseItems,
} from "../services/learning-path.service";
import courseService from "../../courses/services/course.service";
import currencyService from "../../currencies/services/currency.service";

const initialValues = {
  name: null,
  description: null,
  price: null,
  currency_id: null,
  courses: [],
};

const activeOnly = {
  filters: {
    status: { value: 1, matchMode: FilterMatchMode.EQUALS },
  },
};

const formSchema = z.object({
  name: z
    .string({ message: "El campo nombre es obligatorio" })
    .min(4, { message: "Debe tener al menos 4 caracteres" })
    .max(255, { message: "No puede tener más de 255 caracteres" }),
  description: z
    .string({ message: "El campo descripción es obligatorio" })
    .min(6, { message: "Debe tener al menos 6 caracteres" })
    .max(500, { message: "No puede tener más de 500 caracteres" }),
  price: z
    .number({ message: "El precio es obligatorio" })
    .min(0, { message: "El precio no puede ser negativo" })
    .max(99999999.99, { message: "El precio excede el máximo permitido" }),
  currency_id: z.number({ message: "Debe seleccionar una moneda" }),
  courses: z
    .array(z.number())
    .min(1, { message: "Debe seleccionar al menos un curso" }),
});

/*
 * La imagen viaja como `File`: `BaseRepository` detecta el archivo y arma el
 * multipart solo.
 */
const image = ref<File | null>(null);

const onSubmit = (body: Record<string, unknown>) =>
  learningPathService.create({
    ...body,
    image_url: image.value,
    courses: toCourseItems(body.courses as number[]),
  } as never);
</script>
<template>
  <CrudForm
    title="Crear Línea de Carrera"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="learningPaths.list"
    :service="onSubmit"
  >
    <template #default="{ fields, errors }">
      <ImageField
        label="Imagen"
        hint="JPG, PNG o WEBP. Máximo 500 KB."
        accept="image/jpeg,image/png,image/webp"
        :max-kb="500"
        @select="(file) => (image = file)"
      />

      <InputTextCore
        v-model="fields.name.value"
        label="Nombre de la línea"
        :invalid="!!errors.name"
        :message-error="errors.name"
      />
      <TextAreaCore
        v-model="fields.description.value"
        label="Descripción"
        :invalid="!!errors.description"
        :message-error="errors.description"
      />
      <InputNumberCore
        v-model="fields.price.value"
        label="Precio de la línea"
        :invalid="!!errors.price"
        :message-error="errors.price"
        :messages-info="[
          'Precio de referencia para el catálogo; cada programa puede ajustarlo.',
        ]"
        :min="0"
        :min-fraction-digits="2"
        :max-fraction-digits="2"
        placeholder="0.00"
      />
      <SelectCore
        v-model="fields.currency_id.value"
        label="Moneda"
        optionLabel="label"
        optionValue="id"
        placeholder="Seleccione la moneda"
        :invalid="!!errors.currency_id"
        :message-error="errors.currency_id"
        autoLoad
        :service="() => currencyService.all(activeOnly)"
      />
      <MultiselectCore
        v-model="fields.courses.value"
        label="Cursos de la línea · se desbloquean en el orden en que los selecciones"
        filter
        optionLabel="name"
        optionValue="id"
        placeholder="Seleccione los cursos"
        :invalid="!!errors.courses"
        :message-error="errors.courses"
        autoLoad
        :service="() => courseService.all(activeOnly)"
      />
    </template>
  </CrudForm>
</template>
