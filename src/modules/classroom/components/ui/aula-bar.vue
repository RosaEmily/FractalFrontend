<script setup lang="ts">
/**
 * Barra del esqueleto de carga.
 *
 * Las medidas llegan como props y no como clases porque cada barra imita el
 * ancho del dato que va a reemplazar (un título largo, una fecha corta): son
 * valores de contenido, no de diseño, así que no tiene sentido tokenizarlos.
 */
withDefaults(
  defineProps<{
    /** Ancho: porcentaje ("58%") o px (240). */
    w?: string | number;
    h?: number;
    /** Radio. 99 lo vuelve una píldora, para imitar chips. */
    r?: number;
  }>(),
  { w: "100%", h: 12, r: 6 },
);

const size = (value: string | number) =>
  typeof value === "number" ? `${value}px` : value;
</script>

<template>
  <span
    class="aula-shimmer block"
    :style="{ width: size(w), height: size(h), borderRadius: size(r) }"
    aria-hidden="true"
  />
</template>
