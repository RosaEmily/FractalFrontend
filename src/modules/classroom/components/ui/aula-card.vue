<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Eleva la tarjeta al pasar el cursor. Solo si es navegable. */
    hover?: boolean;
    /**
     * `none` es el equivalente a `AulaTable` del diseño: sin padding y con
     * `overflow-hidden`, para que una cabecera de tabla con fondo llegue hasta
     * el borde de la tarjeta en vez de flotar con margen.
     */
    pad?: "none" | "sm" | "md" | "lg";
  }>(),
  { hover: false, pad: "md" },
);
</script>

<template>
  <div
    class="bg-surface-paper border border-line rounded-adm-lg shadow-sm"
    :class="[
      hover ? 'v3-card cursor-pointer' : '',
      pad === 'none'
        ? 'overflow-hidden'
        : pad === 'sm'
          ? 'p-4'
          : pad === 'lg'
            ? 'p-7'
            : 'p-5',
    ]"
  >
    <slot />
  </div>
</template>
