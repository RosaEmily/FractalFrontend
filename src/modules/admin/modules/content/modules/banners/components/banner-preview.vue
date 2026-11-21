<script setup lang="ts">
/**
 * Cómo se ve el banner en el carrusel principal de la landing.
 *
 * Pinta el componente REAL (`landing/components/BannerSection.vue`) con el
 * borrador, no una copia del marcado: si el diseño del home cambia, este
 * preview cambia con él. El `meta` en vivo (antes de guardar) lo arma la página
 * que lo usa a partir de la oferta seleccionada; acá solo se entrega.
 */
import { computed } from "vue";
import BannerSection from "@/modules/landing/components/BannerSection.vue";
import type { Banner } from "@/modules/landing/models/general.model";
import LandingFrame from "../../../components/landing-frame.vue";
import type { BannerMeta } from "../models/banner.model";

const props = defineProps<{
  image: string | null;
  tag: string | null;
  kicker: string | null;
  title: string | null;
  sub: string | null;
  cta: string | null;
  cta2: string | null;
  dark: boolean;
  meta: BannerMeta | null;
}>();

const banner = computed<Banner[]>(() => [
  {
    id: "preview",
    desktop: props.image ?? "",
    mobile: props.image ?? "",
    image_alt: "",
    tag: props.tag || "Etiqueta del banner",
    kicker: props.kicker || "Texto secundario",
    title: props.title || "Título del banner",
    sub: props.sub,
    cta: props.cta,
    cta2: props.cta2,
    dark: props.dark,
    meta: props.meta,
  },
]);
</script>

<template>
  <LandingFrame :width="1280">
    <BannerSection :banner="banner" :skeleton="false" />
  </LandingFrame>
</template>
