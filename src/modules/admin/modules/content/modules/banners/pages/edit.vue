<script setup lang="ts">
import { z } from "zod";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore } from "@/shared/components";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import ImageField from "../../../components/image-field.vue";
import bannerService from "../services/banner.service";
import type { BannerBodyDTO } from "../dto/banner.dto";

const initialValues = ref<BannerBodyDTO>({
  alt_desktop: null,
  alt_mobile: null,
});
const desktop = ref<File | null>(null);
const mobile = ref<File | null>(null);
const currentDesktop = ref<string | null>(null);
const currentMobile = ref<string | null>(null);

const route = useRoute();
const identifier = ref<string>(String(route.params.id));

const formSchema = z.object({
  alt_desktop: z.string().max(255).nullable().optional(),
  alt_mobile: z.string().max(255).nullable().optional(),
});

onMounted(async () => {
  const loadingStore = useLoadingStore();
  loadingStore.start();
  const resp = await bannerService.edit(identifier.value);
  loadingStore.finish();
  if (!resp) return;

  initialValues.value = {
    alt_desktop: resp.alt_desktop,
    alt_mobile: resp.alt_mobile,
  };
  currentDesktop.value = resp.desktop;
  currentMobile.value = resp.mobile;
});
</script>

<template>
  <CrudForm
    title="Actualizar Banner"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="banners.list"
    :service="(body) => bannerService.update(identifier, { ...body, desktop, mobile })"
    submit-label="Actualizar"
  >
    <template #default="{ fields, errors }">
      <ImageField
        label="Imagen de escritorio"
        hint="Déjalo vacío para conservar la imagen actual."
        accept="image/jpeg,image/png,image/webp"
        :current="currentDesktop"
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
        hint="Déjalo vacío para conservar la imagen actual."
        accept="image/jpeg,image/png,image/webp"
        :current="currentMobile"
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
