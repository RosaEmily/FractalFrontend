<script setup lang="ts">
import { z } from "zod";
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

import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";

const route = useRoute();

const initialValues = ref({
  name: null as string | null,
  description: null as string | null,
  price: null as number | null,
  currency_id: null as number | null,
  courses: [] as number[],
});

const identifier = ref<string>(String(route.params.id));

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

/** Imagen ya guardada: el campo la muestra hasta que se elija otra. */
const currentImage = ref<string | null>(null);

const onSubmit = (body: Record<string, unknown>) =>
  learningPathService.update(identifier.value, {
    ...body,
    image_url: image.value,
    courses: toCourseItems(body.courses as number[]),
  } as never);

onMounted(async () => {
  const loadingStore = useLoadingStore();
  loadingStore.start();
  const resp = await learningPathService.edit(identifier.value);
  loadingStore.finish();
  if (!resp) return;
  initialValues.value = {
    name: resp.name,
    description: resp.description,
    price: resp.priceRaw,
    currency_id: resp.currencyId,
    courses: resp.courseIds ?? [],
  };
  currentImage.value = resp.imageUrl;
});
</script>
<template>
  <CrudForm
    title="Actualizar Línea de Carrera"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="learningPaths.list"
    :service="onSubmit"
    submit-label="Actualizar"
  >
    <template #default="{ fields, errors }">
      <ImageField
        label="Imagen"
        hint="JPG, PNG o WEBP. Máximo 500 KB."
        accept="image/jpeg,image/png,image/webp"
        :max-kb="500"
        :current="currentImage"
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
