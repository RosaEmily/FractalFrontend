<script setup lang="ts">
import { z } from "zod";
import { computed, onBeforeUnmount, ref, watch } from "vue";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore } from "@/shared/components";
import ImageField from "@/modules/admin/components/ui/image-field.vue";
import FieldPreview from "../../../components/field-preview.vue";
import BannerPreview from "../components/banner-preview.vue";
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

/*
 * La imagen elegida todavía no está en S3, así que la vista previa usa una URL
 * local del archivo. Se libera al reemplazarla y al desmontar: cada
 * `createObjectURL` retiene el archivo en memoria hasta que se revoca.
 */
const desktopUrl = ref<string | null>(null);

watch(desktop, (file, previous) => {
  if (desktopUrl.value) URL.revokeObjectURL(desktopUrl.value);
  desktopUrl.value = file ? URL.createObjectURL(file) : null;
  void previous;
});

onBeforeUnmount(() => {
  if (desktopUrl.value) URL.revokeObjectURL(desktopUrl.value);
});

const previewImage = computed(() => desktopUrl.value);
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

      <FieldPreview hint="así se ve en el carrusel principal (escritorio)">
        <BannerPreview
          :image="previewImage"
          :alt="fields.alt_desktop.value as string | null"
        />
      </FieldPreview>
    </template>
  </CrudForm>
</template>
