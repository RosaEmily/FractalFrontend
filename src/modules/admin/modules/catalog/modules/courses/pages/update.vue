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

import courseService from "../services/course.service";
import currencyService from "../../currencies/services/currency.service";
import tagService from "../../tags/services/tag.service";

import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import type { CourseBodyDTO } from "../dto/course.dto";

const route = useRoute();

const initialValues = ref<CourseBodyDTO>({
  name: null,
  description: null,
  price: null,
  currency_id: null,
  tags: [],
});

const identifier = ref<string>(String(route.params.id));

const activeOnly = {
  filters: {
    status: { value: 1, matchMode: FilterMatchMode.EQUALS },
  },
};


/*
 * La imagen viaja como `File`: `BaseRepository` detecta el archivo y arma el
 * multipart solo (con method spoofing en el update, porque PHP no parsea
 * multipart/form-data en PUT).
 */
const image = ref<File | null>(null);
/** Imagen ya guardada: el campo la muestra hasta que se elija otra. */
const currentImage = ref<string | null>(null);

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
  tags: z.array(z.number()).optional(),
});

onMounted(async () => {
  const loadingStore = useLoadingStore();
  loadingStore.start();
  const resp = await courseService.edit(identifier.value);
  loadingStore.finish();
  if (!resp) return;
  initialValues.value = {
    name: resp.name,
    description: resp.description,
    price: resp.priceRaw,
    currency_id: resp.currencyId,
    tags: resp.tagIds ?? [],
  };
  currentImage.value = resp.imageUrl;
});
</script>
<template>
  <CrudForm
    title="Actualizar Curso"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="courses.list"
    :service="(body) => courseService.update(identifier, { ...body, image_url: image })"
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
        label="Nombre del curso"
        :invalid="!!errors.name"
        :message-error="errors.name"
      />
      <TextAreaCore
        v-model="fields.description.value"
        label="Descripción"
        :invalid="!!errors.description"
        :message-error="errors.description"
        :messages-info="['Se muestra en la landing y en el detalle del curso.']"
      />
      <InputNumberCore
        v-model="fields.price.value"
        label="Precio base"
        :invalid="!!errors.price"
        :message-error="errors.price"
        :messages-info="[
          'Precio de referencia del curso suelto; cada programa puede ofrecerlo con su propio precio de cohorte.',
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
        v-model="fields.tags.value"
        label="Tags"
        filter
        optionLabel="name"
        optionValue="id"
        placeholder="Seleccione los tags"
        autoLoad
        :service="() => tagService.all(activeOnly)"
      />
    </template>
  </CrudForm>
</template>
