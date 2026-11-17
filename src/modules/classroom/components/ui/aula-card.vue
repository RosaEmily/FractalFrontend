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
    /**
     * `ink` es la tarjeta oscura del diseño (próxima clase). Es una variante y no
     * una clase suelta: con `bg-secondary-900` desde fuera, `bg-surface-paper`
     * ganaba por orden en el CSS generado y el texto blanco quedaba invisible.
     */
    tone?: "paper" | "ink";
  }>(),
  { hover: false, pad: "md", tone: "paper" },
);
</script>

<template>
  <div
    class="border rounded-adm-lg shadow-sm"
    :class="[
      tone === 'ink'
        ? 'bg-secondary-900 border-secondary-900'
        : 'bg-surface-paper border-line',
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
