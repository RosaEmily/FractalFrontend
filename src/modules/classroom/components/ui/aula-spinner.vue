<script setup lang="ts">
/**
 * Spinner pequeño para los botones de guardar del aula.
 *
 * El diseño (`shell.jsx` → `AulaSpinner`) REEMPLAZA el icono mientras el
 * servicio responde, en vez de solo deshabilitarlo: un ✓ apagado no distingue
 * "no hay nada que guardar" de "se está guardando", y el docente vuelve a
 * pulsar creyendo que no pasó nada.
 *
 * Hereda el color del texto del botón (`currentColor`), así que sirve igual
 * sobre el verde del check que sobre el fondo oscuro de la barra flotante.
 */
withDefaults(defineProps<{ size?: number }>(), { size: 13 });
</script>

<template>
  <svg
    class="aula-spin"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-dasharray="34 100"
      opacity="0.9"
    />
  </svg>
</template>
