<script setup lang="ts">
import { useId } from "vue";

/**
 * Retícula tipo plano de fondo. Es la marca de la casa (BIM/CAD) y aparece en
 * el hero de la landing y en las pantallas de estado.
 *
 * Dos patrones anidados: uno fino cada `size` px y otro más marcado cada
 * `thickEvery` celdas, como el papel milimetrado de un plano.
 */
withDefaults(
  defineProps<{ size?: number; thickEvery?: number; opacity?: number }>(),
  { size: 32, thickEvery: 5, opacity: 0.028 },
);

// Los ids de <pattern> son globales al documento: dos retículas en la misma
// página con el mismo id harían que la segunda reutilizara la primera.
const uid = useId();
</script>

<template>
  <svg
    width="100%"
    height="100%"
    class="pointer-events-none absolute inset-0"
    aria-hidden="true"
  >
    <defs>
      <pattern :id="`bp-${uid}`" :width="size" :height="size" patternUnits="userSpaceOnUse">
        <path
          :d="`M${size},0 H0 V${size}`"
          class="stroke-secondary-900"
          :stroke-opacity="opacity * 0.5"
          stroke-width="0.5"
          fill="none"
        />
      </pattern>
      <pattern
        :id="`bp-${uid}-thick`"
        :width="size * thickEvery"
        :height="size * thickEvery"
        patternUnits="userSpaceOnUse"
      >
        <rect width="100%" height="100%" :fill="`url(#bp-${uid})`" />
        <path
          :d="`M${size * thickEvery},0 H0 V${size * thickEvery}`"
          class="stroke-secondary-900"
          :stroke-opacity="opacity"
          stroke-width="0.7"
          fill="none"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" :fill="`url(#bp-${uid}-thick)`" />
  </svg>
</template>
