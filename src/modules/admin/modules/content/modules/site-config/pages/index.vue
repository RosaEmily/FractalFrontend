<script setup lang="ts">
/**
 * Configuración del sitio público.
 *
 * Registro único (`GET`/`PUT landing/config`): no hay listado, ni id, ni
 * borrado, así que no usa `SectionList` ni el patrón CRUD.
 *
 * Lleva DOS vistas previas porque son dos superficies distintas y ninguna se
 * puede comprobar sin publicar: la pestaña del navegador (nombre + meta título)
 * y el resultado de búsqueda tipo Google (título + URL + descripción).
 */
import { z } from "zod";
import { computed, onMounted, ref } from "vue";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import { InputTextCore, TextAreaCore } from "@/shared/components";
import FieldPreview from "../../../components/field-preview.vue";
import { useLoadingStore } from "@/shared/stores/useLoadingStore";
import siteConfigService from "../services/site-config.service";
import type { SiteConfigBodyDTO } from "../dto/site-config.dto";

/** Dominio público, solo para que la vista previa se parezca a la real. */
const SITE_URL = "proyectofractal.com";

/** Los que Google recorta; el contador avisa antes de pasarse. */
const META_TITLE_MAX = 60;
const META_DESCRIPTION_MAX = 160;

const initialValues = ref<SiteConfigBodyDTO>({
  site_name: null,
  whatsapp: null,
  meta_title: null,
  meta_description: null,
  complaints_book: null,
});

/** Se refresca con lo que el usuario escribe: alimenta las vistas previas. */
const current = ref<SiteConfigBodyDTO>({ ...initialValues.value });

const formSchema = z.object({
  site_name: z
    .string({ message: "El nombre del sitio es obligatorio" })
    .min(2, { message: "Debe tener al menos 2 caracteres" })
    .max(100, { message: "No puede tener más de 100 caracteres" }),
  whatsapp: z
    .string({ message: "El WhatsApp es obligatorio" })
    .regex(/^\+?[0-9]+$/, {
      message: "Solo números, con un + opcional al inicio",
    })
    .max(20, { message: "No puede tener más de 20 caracteres" }),
  meta_title: z
    .string({ message: "El meta título es obligatorio" })
    .max(META_TITLE_MAX, {
      message: `Google recorta a partir de ${META_TITLE_MAX} caracteres`,
    }),
  meta_description: z
    .string({ message: "La meta descripción es obligatoria" })
    .max(META_DESCRIPTION_MAX, {
      message: `Google recorta a partir de ${META_DESCRIPTION_MAX} caracteres`,
    }),
  complaints_book: z
    .string()
    .url({ message: "Debe ser una URL válida" })
    .nullable()
    .optional(),
});

const titlePreview = computed(
  () => current.value.meta_title || current.value.site_name || "Fractal Studio",
);
const descriptionPreview = computed(
  () =>
    current.value.meta_description ||
    "Añade una meta descripción para controlar el texto que aparece aquí.",
);

/** Enlace real que abriría el botón flotante de la landing. */
const whatsappLink = computed(() => {
  const digits = (current.value.whatsapp ?? "").replace(/[^0-9]/g, "");
  return digits ? `wa.me/${digits}` : "Sin número configurado";
});

onMounted(async () => {
  const loadingStore = useLoadingStore();
  loadingStore.start();
  const resp = await siteConfigService.show();
  loadingStore.finish();
  if (!resp) return;

  initialValues.value = {
    site_name: resp.siteName,
    whatsapp: resp.whatsapp,
    meta_title: resp.metaTitle,
    meta_description: resp.metaDescription,
    complaints_book: resp.complaintsBook,
  };
  current.value = { ...initialValues.value };
});
</script>

<template>
  <CrudForm
    title="Configuración del sitio"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="siteConfig"
    :service="(body) => siteConfigService.update(body as SiteConfigBodyDTO)"
    submit-label="Guardar"
  >
    <template #default="{ fields, errors }">
      <div class="grid gap-4 md:grid-cols-2">
        <InputTextCore
          v-model="fields.site_name.value"
          label="Nombre del sitio"
          required
          :invalid="!!errors.site_name"
          :message-error="errors.site_name"
          :messages-info="['Aparece en la pestaña del navegador.']"
          @update:model-value="current.site_name = $event"
        />
        <InputTextCore
          v-model="fields.whatsapp.value"
          label="WhatsApp flotante"
          required
          hint-label="Solo números, con código de país."
          placeholder="+51999999999"
          :invalid="!!errors.whatsapp"
          :message-error="errors.whatsapp"
          @update:model-value="current.whatsapp = $event"
        />
      </div>

      <InputTextCore
        v-model="fields.meta_title.value"
        label="Meta título (SEO)"
        required
        :invalid="!!errors.meta_title"
        :message-error="errors.meta_title"
        :messages-info="[
          `${(current.meta_title ?? '').length} de ${META_TITLE_MAX} caracteres.`,
        ]"
        @update:model-value="current.meta_title = $event"
      />

      <TextAreaCore
        v-model="fields.meta_description.value"
        label="Meta descripción (SEO)"
        required
        :invalid="!!errors.meta_description"
        :message-error="errors.meta_description"
        :messages-info="[
          `${(current.meta_description ?? '').length} de ${META_DESCRIPTION_MAX} caracteres.`,
        ]"
        @update:model-value="current.meta_description = $event"
      />

      <InputTextCore
        v-model="fields.complaints_book.value"
        label="Libro de reclamaciones"
        hint-label="Enlace externo del pie de página."
        :invalid="!!errors.complaints_book"
        :message-error="errors.complaints_book"
      />

      <!-- Pestaña del navegador -->
      <FieldPreview label="Pestaña del navegador" hint="así se ve al abrir la web">
        <div class="w-full max-w-100">
          <div class="flex items-end gap-1">
            <div
              class="flex items-center gap-2 rounded-t-adm-md bg-surface-paper border border-line border-b-0 px-3 py-2 max-w-72"
            >
              <span
                class="size-4 shrink-0 rounded-adm-sm bg-primary-500 text-surface-paper font-display text-[0.5rem] font-bold grid place-items-center"
              >
                F
              </span>
              <span class="truncate text-adm-xs text-secondary-900">
                {{ titlePreview }}
              </span>
            </div>
          </div>
          <div
            class="rounded-adm-md rounded-tl-none border border-line bg-surface-paper px-3 py-2"
          >
            <span class="font-mono text-adm-xs text-secondary-400">
              {{ SITE_URL }}
            </span>
          </div>
        </div>
      </FieldPreview>

      <!-- Resultado de búsqueda -->
      <FieldPreview label="Resultado en Google" hint="así aparece al buscarte">
        <div class="w-full max-w-150 text-left">
          <p class="font-mono text-adm-xs text-secondary-400">
            {{ SITE_URL }}
          </p>
          <p class="text-adm-lg text-info-DEFAULT mt-0.5 truncate">
            {{ titlePreview }}
          </p>
          <p class="text-adm-sm text-secondary-500 mt-1 line-clamp-2">
            {{ descriptionPreview }}
          </p>
        </div>
      </FieldPreview>

      <!-- Botón flotante -->
      <FieldPreview label="Botón de WhatsApp" hint="enlace que abre el visitante">
        <span class="font-mono text-adm-sm text-secondary-500">
          {{ whatsappLink }}
        </span>
      </FieldPreview>
    </template>
  </CrudForm>
</template>
