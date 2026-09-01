<script setup lang="ts">
import { z } from "zod";
import { ref } from "vue";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore } from "@/shared/components";
import ImageField from "../../../components/image-field.vue";
import bannerService from "../services/banner.service";
import type { BannerBodyDTO } from "../dto/banner.dto";

const initialValues = ref<BannerBodyDTO>({
  alt_desktop: null,
  alt_mobile: null,
});
const desktop = ref<File | null>(null);
const mobile = ref<File | null>(null);

const formSchema = z.object({
  alt_desktop: z.string().max(255).nullable().optional(),
  alt_mobile: z.string().max(255).nullable().optional(),
});
</script>

<template>
  <CrudForm
    title="Crear Banner"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="banners.list"
    :service="(body) => bannerService.create({ ...body, desktop, mobile })"
  >
    <template #default="{ fields, errors }">
      <ImageField
        label="Imagen de escritorio"
        hint="JPG, PNG o WEBP. Máximo 800 KB."
        accept="image/jpeg,image/png,image/webp"
        @select="(file) => (desktop = file)"
      />
      <InputTextCore
        v-model="fields.alt_desktop.value"
        label="Texto alternativo (escritorio)"
        :invalid="!!errors.alt_desktop"
        :message-error="errors.alt_desktop"
      />
      <ImageField
        label="Imagen móvil"
        hint="JPG, PNG o WEBP. Máximo 800 KB."
        accept="image/jpeg,image/png,image/webp"
        @select="(file) => (mobile = file)"
      />
      <InputTextCore
        v-model="fields.alt_mobile.value"
        label="Texto alternativo (móvil)"
        :invalid="!!errors.alt_mobile"
        :message-error="errors.alt_mobile"
      />
    </template>
  </CrudForm>
</template>
