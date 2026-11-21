<script setup lang="ts">
/**
 * Vista previa de un patrocinador con la sección real del home
 * (`PartnersSection`): la celda con el nombre y la franja de logos.
 */
import { computed } from "vue";
import PartnersSection from "@/modules/landing/components/PartnersSection.vue";
import LandingFrame from "../../../components/landing-frame.vue";

const props = defineProps<{ name: string | null; imageUrl: string | null }>();

const partners = computed(() => [
  {
    id: "preview",
    name: props.name || "Nombre del patrocinador",
    image_url: props.imageUrl ?? "",
    image_alt: props.name ?? "",
  },
]);
</script>

<template>
  <LandingFrame :width="1280">
    <PartnersSection :partners="partners" :skeleton="false" />
  </LandingFrame>
</template>
