<script setup lang="ts">
/**
 * Fila de campos del formulario. El diseño usa rejillas de 2 o 3 columnas
 * que colapsan a una sola en pantallas chicas.
 */
interface Props {
  cols?: 1 | 2 | 3;
}
withDefaults(defineProps<Props>(), { cols: 2 });
</script>

<template>
  <div
    class="grid gap-4"
    :class="{
      'grid-cols-1': cols === 1,
      'grid-cols-1 sm:grid-cols-2': cols === 2,
      'grid-cols-1 sm:grid-cols-3': cols === 3,
    }"
  >
    <slot />
  </div>
</template>
