<script setup lang="ts">
import { z } from "zod";
import { computed, onBeforeUnmount, ref, watch } from "vue";

import CrudForm from "@/modules/admin/components/Section/crud-form.vue";
import {
  InputNumberCore,
  InputTextCore,
  TextAreaCore,
  SelectCore,
} from "@/shared/components";
import ImageField from "@/modules/admin/components/ui/image-field.vue";
import ToggleCheck from "@/modules/admin/components/ui/toggle-check.vue";
import FieldPreview from "../../../components/field-preview.vue";
import BannerPreview from "../components/banner-preview.vue";
import bannerService from "../services/banner.service";
import offerService from "@/modules/admin/modules/catalog/modules/offers/services/offer.service";
import type { Offer } from "@/modules/admin/modules/catalog/modules/offers/models/offer.model";
import { buildOfferBannerMeta } from "@/shared/utils/offer-banner-meta";
import { safeRequest } from "@/shared/utils/request";
import { BusinessError } from "@/shared/errors/business.error";
import dayjs from "dayjs";
import type { BannerBodyDTO } from "../dto/banner.dto";

const initialValues = ref<BannerBodyDTO>({
  alt_desktop: null,
  alt_mobile: null,
  tag: null,
  kicker: null,
  title: null,
  sub: null,
  // Precargados como valor real (no solo placeholder): el admin los borra o
  // cambia si no aplican, pero la mayoría de banners sí usa este par de CTAs.
  cta: "Inscribirme ahora",
  cta2: "Ver malla curricular",
  dark: false,
  order: null,
  offer_id: null,
});
/*
 * `string` = URL sugerida de la oferta asociada (ya está en S3, viaja tal
 * cual al backend); `File` = archivo real elegido por el admin, se manda
 * como multipart. Ver `onOfferChange` para cómo se sugiere y se limpia.
 */
const desktop = ref<File | string | null>(null);
const mobile = ref<File | string | null>(null);

/*
 * Distingue "el admin subió su propio archivo" de "sigue la sugerencia de la
 * oferta": si cambia o se desasocia la oferta, solo se limpia la sugerencia,
 * nunca un archivo que el admin ya haya elegido.
 */
const desktopIsSuggested = ref(false);
const mobileIsSuggested = ref(false);

/*
 * `desktop`/`mobile` viven FUERA del schema de Zod (`formSchema`), así que
 * `CrudForm` no tiene dónde guardar un error de backend sobre esos dos
 * campos — un 422 en `desktop`/`mobile` quedaba invisible: el formulario
 * "no hacía nada" al enviar, sin decir por qué. Se capturan acá aparte.
 */
const desktopError = ref<string | null>(null);
const mobileError = ref<string | null>(null);

/*
 * `CrudForm` ya envuelve `service(values)` en su propio `safeRequest` y usa
 * `error.details` para pintar el error en `errors.<campo>` — pero eso solo
 * funciona para campos registrados en el schema de Zod. `desktop`/`mobile`
 * viven FUERA de `formSchema` (son archivos/URLs, no parte del payload
 * tipado), así que un 422 sobre esos dos campos no tenía dónde mostrarse: el
 * botón "no hacía nada" sin explicar por qué. Se intercepta acá, dejando que
 * la excepción siga su curso normal hacia `CrudForm`.
 */
const submitBanner = async (body: BannerBodyDTO) => {
  desktopError.value = null;
  mobileError.value = null;
  try {
    return await bannerService.create({ ...body, desktop: desktop.value, mobile: mobile.value });
  } catch (e: unknown) {
    if (e instanceof BusinessError && e.errors && !Array.isArray(e.errors)) {
      desktopError.value = e.errors.desktop?.[0] ?? null;
      mobileError.value = e.errors.mobile?.[0] ?? null;
    }
    throw e;
  }
};

const loadOffers = async (): Promise<Offer[]> =>
  await offerService.all({ status: 1 });

const formSchema = z.object({
  alt_desktop: z.string().max(255).nullable().optional(),
  alt_mobile: z.string().max(255).nullable().optional(),
  tag: z.string().max(255).nullable().optional(),
  kicker: z.string().max(255).nullable().optional(),
  title: z.string().max(255).nullable().optional(),
  sub: z.string().max(1000).nullable().optional(),
  cta: z.string().max(255).nullable().optional(),
  cta2: z.string().max(255).nullable().optional(),
  dark: z.boolean(),
  order: z
    .number()
    .int()
    .min(0, { message: "No puede ser negativo" })
    .max(9999, { message: "Valor demasiado alto" })
    .nullable()
    .optional(),
  offer_id: z.number().nullable().optional(),
});

/*
 * Un archivo recién elegido todavía no está en S3, así que la vista previa
 * usa una URL local. Se libera al reemplazarla y al desmontar: cada
 * `createObjectURL` retiene el archivo en memoria hasta que se revoca. Una
 * sugerencia de oferta (string) ya es una URL real: no necesita esto.
 */
const desktopUrl = ref<string | null>(null);

watch(desktop, (value, previous) => {
  if (desktopUrl.value) URL.revokeObjectURL(desktopUrl.value);
  desktopUrl.value = value instanceof File ? URL.createObjectURL(value) : null;
  void previous;
});

onBeforeUnmount(() => {
  if (desktopUrl.value) URL.revokeObjectURL(desktopUrl.value);
});

const previewImage = computed(() =>
  desktopUrl.value ?? (typeof desktop.value === "string" ? desktop.value : null),
);

/** `ImageField` de cada campo muestra la sugerencia de la oferta como `current`, mientras siga siendo la sugerencia (no un archivo ya elegido). */
const desktopSuggestedUrl = computed(() =>
  desktopIsSuggested.value && typeof desktop.value === "string" ? desktop.value : null,
);
const mobileSuggestedUrl = computed(() =>
  mobileIsSuggested.value && typeof mobile.value === "string" ? mobile.value : null,
);

/*
 * `meta` no se guarda hasta el submit (el backend lo calcula), así que el
 * preview en vivo lo deriva acá mismo de la oferta elegida.
 */
const selectedOffer = ref<Offer | null>(null);
const previewMeta = computed(() => buildOfferBannerMeta(selectedOffer.value));

/*
 * Ficha de resumen ("Vigente desde/hasta") entre el selector y el preview:
 * a diferencia de `previewMeta` (inicio + duración calculada, tal como se ve
 * en el home), acá se muestra el RANGO real de matrícula de la oferta, dato
 * que el preview no expone.
 */
const selectedOfferValidity = computed(() => ({
  from: selectedOffer.value?.enrollmentStartDate
    ? dayjs(selectedOffer.value.enrollmentStartDate).format("DD MMM YYYY")
    : "—",
  to: selectedOffer.value?.enrollmentEndDate
    ? dayjs(selectedOffer.value.enrollmentEndDate).format("DD MMM YYYY")
    : "—",
}));

/** "NUEVO CURSO"/"NUEVA LÍNEA DE CARRERA" — derivado del tipo real, nunca texto de cohorte inventado. */
const OFFER_TYPE_TAG: Record<Offer["type"], string> = {
  course: "NUEVO CURSO",
  learning_path: "NUEVA LÍNEA DE CARRERA",
};

/** Limpia la sugerencia de imagen (nunca un archivo que el admin ya haya elegido). */
const clearSuggestedImages = () => {
  if (desktopIsSuggested.value) {
    desktop.value = null;
    desktopIsSuggested.value = false;
  }
  if (mobileIsSuggested.value) {
    mobile.value = null;
    mobileIsSuggested.value = false;
  }
};

/**
 * `fields` solo existe en el slot del `CrudForm` (`#default="{ fields }"`),
 * así que la sugerencia de Título/Etiqueta se aplica desde el template,
 * pasando `fields` como parámetro — acá solo se resuelve la oferta.
 */
const onOfferChange = async (
  offerId: string | number | null,
  fields?: { title: { value: unknown }; tag: { value: unknown } },
) => {
  selectedOffer.value = null;
  clearSuggestedImages();
  if (!offerId) return;

  const { data } = await safeRequest(() => offerService.edit(offerId), {
    showAlert: false,
  });
  selectedOffer.value = data;
  if (!data || !fields) return;

  // Solo SUGIERE: no pisa lo que el admin ya haya escrito a mano.
  if (!fields.title.value) fields.title.value = `**${data.name}**`;
  if (!fields.tag.value) fields.tag.value = OFFER_TYPE_TAG[data.type];

  // Ídem con las imágenes: solo si el admin todavía no eligió su propio
  // archivo (`desktop`/`mobile` siguen `null`).
  if (data.imageUrl) {
    if (desktop.value === null) {
      desktop.value = data.imageUrl;
      desktopIsSuggested.value = true;
    }
    if (mobile.value === null) {
      mobile.value = data.imageUrl;
      mobileIsSuggested.value = true;
    }
  }
};
</script>

<template>
  <CrudForm
    title="Crear Banner"
    :schema="formSchema"
    :initialValues="initialValues"
    redirect="banners.list"
    :service="submitBanner"
  >
    <template #default="{ fields, errors }">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectCore
          v-model="fields.offer_id.value"
          label="Oferta asociada"
          hint-label="Los datos de inicio, duración, cupos y precio se calculan desde la oferta y se guardan como foto: si la oferta cambia después, hay que volver a guardar el banner."
          filter
          show-clear
          option-label="name"
          option-value="id"
          placeholder="Sin oferta asociada"
          :service="loadOffers"
          auto-load
          :invalid="!!errors.offer_id"
          :message-error="errors.offer_id"
          @update:model-value="(value: string | number | null) => onOfferChange(value, fields)"
        />
        <InputNumberCore
          v-model="fields.order.value"
          label="Orden en el carrusel"
          placeholder="1"
          :min="1"
          :invalid="!!errors.order"
          :message-error="errors.order"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ImageField
          label="Imagen de escritorio"
          hint="JPG, PNG o WEBP. Máximo 800 KB."
          accept="image/jpeg,image/png,image/webp"
          :current="desktopSuggestedUrl"
          :invalid="!!desktopError"
          :message-error="desktopError"
          @select="(file) => { desktop = file; desktopIsSuggested = false; desktopError = null; }"
        />
        <ImageField
          label="Imagen móvil"
          hint="JPG, PNG o WEBP. Máximo 800 KB."
          accept="image/jpeg,image/png,image/webp"
          :current="mobileSuggestedUrl"
          :invalid="!!mobileError"
          :message-error="mobileError"
          @select="(file) => { mobile = file; mobileIsSuggested = false; mobileError = null; }"
        />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputTextCore
          v-model="fields.alt_desktop.value"
          label="Texto alternativo (escritorio)"
          :invalid="!!errors.alt_desktop"
          :message-error="errors.alt_desktop"
        />
        <InputTextCore
          v-model="fields.alt_mobile.value"
          label="Texto alternativo (móvil)"
          :invalid="!!errors.alt_mobile"
          :message-error="errors.alt_mobile"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputTextCore
          v-model="fields.tag.value"
          label="Etiqueta"
          hint-label="Ej: NUEVA COHORTE · JUL 2025"
          :invalid="!!errors.tag"
          :message-error="errors.tag"
        />
        <InputTextCore
          v-model="fields.kicker.value"
          label="Texto secundario"
          hint-label="Ej: 15 cupos disponibles"
          :invalid="!!errors.kicker"
          :message-error="errors.kicker"
        />
      </div>
      <InputTextCore
        v-model="fields.title.value"
        label="Título"
        hint-label="Envuelve la parte a resaltar entre ** ** (ej: Conviértete en el **modelador BIM** que la industria busca)."
        :invalid="!!errors.title"
        :message-error="errors.title"
      />
      <TextAreaCore
        v-model="fields.sub.value"
        label="Subtítulo"
        :invalid="!!errors.sub"
        :message-error="errors.sub"
      />
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputTextCore
          v-model="fields.cta.value"
          label="Botón principal"
          hint-label="Ej: Inscribirme ahora"
          :invalid="!!errors.cta"
          :message-error="errors.cta"
        />
        <InputTextCore
          v-model="fields.cta2.value"
          label="Botón secundario"
          hint-label="Ej: Ver malla curricular"
          :invalid="!!errors.cta2"
          :message-error="errors.cta2"
        />
      </div>
      <ToggleCheck
        label="Fondo oscuro"
        hint="El carrusel del home alterna banners claros y oscuros."
        :on="!!fields.dark.value"
        @toggle="fields.dark && (fields.dark.value = $event)"
      />

      <div
        v-if="selectedOffer"
        class="bg-surface-page border border-line rounded-adm-md px-4 py-3.5 grid grid-cols-2 md:grid-cols-4 gap-3.5"
      >
        <div>
          <p class="font-mono text-adm-xs text-secondary-400 uppercase tracking-wide">Vigente desde</p>
          <p class="font-display text-adm-base font-bold text-secondary-900 mt-0.5">
            {{ selectedOfferValidity.from }}
          </p>
        </div>
        <div>
          <p class="font-mono text-adm-xs text-secondary-400 uppercase tracking-wide">Vigente hasta</p>
          <p class="font-display text-adm-base font-bold text-secondary-900 mt-0.5">
            {{ selectedOfferValidity.to }}
          </p>
        </div>
        <div>
          <p class="font-mono text-adm-xs text-secondary-400 uppercase tracking-wide">Cupos</p>
          <p class="font-display text-adm-base font-bold text-secondary-900 mt-0.5">
            {{ selectedOffer.seats }}
          </p>
        </div>
        <div>
          <p class="font-mono text-adm-xs text-secondary-400 uppercase tracking-wide">Precio</p>
          <p class="font-display text-adm-base font-bold text-secondary-900 mt-0.5">
            {{ selectedOffer.price ?? "—" }}
          </p>
        </div>
      </div>

      <FieldPreview hint="así se ve en el carrusel principal del home">
        <BannerPreview
          :image="previewImage"
          :tag="fields.tag.value as string | null"
          :kicker="fields.kicker.value as string | null"
          :title="fields.title.value as string | null"
          :sub="fields.sub.value as string | null"
          :cta="fields.cta.value as string | null"
          :cta2="fields.cta2.value as string | null"
          :dark="!!fields.dark.value"
          :meta="previewMeta"
        />
      </FieldPreview>
    </template>
  </CrudForm>
</template>
