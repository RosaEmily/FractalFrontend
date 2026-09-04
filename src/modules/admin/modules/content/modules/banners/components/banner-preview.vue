<script setup lang="ts">
/**
 * Cómo se ve el banner en el carrusel principal de la landing (escritorio).
 *
 * Si ya hay imagen se muestra la real; si todavía no se eligió, un lienzo con
 * el degradado del carrusel para que el texto alternativo se lea en contexto.
 */
import { computed } from "vue";

const props = defineProps<{ image: string | null; alt: string | null }>();

const caption = computed(
  () => props.alt || "Diplomado BIM 2026 · Cohorte marzo",
);
</script>

<template>
  <div
    class="relative w-full h-[8.75rem] overflow-hidden rounded-adm-md border border-line flex items-end p-[1.125rem]"
    :class="props.image ? '' : 'bg-linear-135 from-accent-soft to-admin-bg'"
  >
    <img
      v-if="props.image"
      :src="props.image"
      :alt="caption"
      class="absolute inset-0 size-full object-cover"
    />
    <span
      v-else
      class="absolute right-5 top-5 size-20 rounded-adm-md bg-surface-paper border border-line opacity-60"
    />
    <span
      class="relative font-display text-adm-xl font-bold text-secondary-900"
      :class="props.image ? 'text-surface-paper drop-shadow' : ''"
    >
      {{ caption }}
    </span>
  </div>
</template>
