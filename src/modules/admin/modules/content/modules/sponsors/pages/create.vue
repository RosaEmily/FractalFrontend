<script setup lang="ts">
import { z } from "zod";
import { ref, computed } from "vue";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore } from "@/shared/components";
import ImageField from "@/modules/admin/components/ui/image-field.vue";
import FieldPreview from "../../../components/field-preview.vue";
import SponsorPreview from "../components/sponsor-preview.vue";
import { useObjectUrl } from "@/modules/admin/composables/useObjectUrl";
import sponsorService from "../services/sponsor.service";
import type { SponsorBodyDTO } from "../dto/sponsor.dto";

const initialValues = ref<SponsorBodyDTO>({ name: null });
const image = ref<File | null>(null);
const imageUrl = useObjectUrl(image);
const previewImage = computed(() => imageUrl.value);

const formSchema = z.object({
  name: z
    .string({ message: "El nombre es obligatorio" })
    .min(3, { message: "Debe tener al menos 3 caracteres" })
    .max(255, { message: "No puede tener más de 255 caracteres" }),
});
</script>

<template>
  <CrudForm
    title="Crear Patrocinador"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="sponsors.list"
    :service="(body) => sponsorService.create({ ...body, image })"
  >
    <template #default="{ fields, errors }">
      <InputTextCore
        v-model="fields.name.value"
        label="Nombre"
        :invalid="!!errors.name"
        :message-error="errors.name"
      />
      <ImageField
        label="Logo"
        hint="JPG, PNG, WEBP o SVG. Máximo 100 KB."
        :max-kb="100"
        @select="(file) => (image = file)"
      />

      <FieldPreview hint="así se ve en el home → Patrocinadores">
        <SponsorPreview :name="fields.name.value" :image-url="previewImage" />
      </FieldPreview>
    </template>
  </CrudForm>
</template>
