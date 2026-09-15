<script setup lang="ts">
import { z } from "zod";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore } from "@/shared/components";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
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
const currentDesktop = ref<string | null>(null);
const currentMobile = ref<string | null>(null);

const route = useRoute();
const identifier = ref<string>(String(route.params.id));

const formSchema = z.object({
  alt_desktop: z.string().max(255).nullable().optional(),
  alt_mobile: z.string().max(255).nullable().optional(),
});

/*
 * URL local del archivo recién elegido; se libera al reemplazarlo y al
 * desmontar. Manda sobre la imagen guardada: es lo que se va a publicar.
 */
const desktopUrl = ref<string | null>(null);

watch(desktop, (file) => {
  if (desktopUrl.value) URL.revokeObjectURL(desktopUrl.value);
  desktopUrl.value = file ? URL.createObjectURL(file) : null;
});

onBeforeUnmount(() => {
  if (desktopUrl.value) URL.revokeObjectURL(desktopUrl.value);
});

const previewImage = computed(() => desktopUrl.value ?? currentDesktop.value);

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

      <FieldPreview hint="así se ve en el carrusel principal (escritorio)">
        <BannerPreview
          :image="previewImage"
          :alt="fields.alt_desktop.value as string | null"
        />
      </FieldPreview>
    </template>
  </CrudForm>
</template>
