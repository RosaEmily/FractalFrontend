<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Eleva la tarjeta al pasar el cursor. Solo si es navegable. */
    hover?: boolean;
    pad?: "sm" | "md" | "lg";
  }>(),
  { hover: false, pad: "md" },
);
</script>

<template>
  <div
    class="bg-surface-paper border border-line rounded-adm-lg"
    :class="[
      hover ? 'v3-card cursor-pointer' : '',
      pad === 'sm' ? 'p-4' : pad === 'lg' ? 'p-7' : 'p-5',
    ]"
  >
    <slot />
  </div>
</template>
