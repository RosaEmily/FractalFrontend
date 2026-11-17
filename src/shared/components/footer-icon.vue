<script setup lang="ts">
import { computed } from "vue";
import { FOOTER_ICONS, isFooterIcon } from "@/shared/utils/footer-icons";

const props = withDefaults(defineProps<{ name?: string | null; size?: number }>(), { size: 14 });
const body = computed(() => (isFooterIcon(props.name) ? FOOTER_ICONS[props.name] : ""));
</script>

<template>
  <!-- El contenido sale del catálogo fijo de footer-icons.ts, nunca de datos del usuario. -->
  <svg
    v-if="body"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="body"
  />
</template>
