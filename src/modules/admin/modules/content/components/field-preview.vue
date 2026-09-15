<script setup lang="ts">
/**
 * Vista previa en vivo de cómo se verá el valor en la landing.
 *
 * El diseño la exige en TODO lo que se publica: los 7 módulos de Sitio web.
 * Quien edita esta sección es marketing, no un técnico — sin ver el resultado
 * hay que publicar y abrir la web para saber si quedó bien.
 */
interface Props {
  label?: string;
  hint: string;
}
withDefaults(defineProps<Props>(), { label: "Vista previa" });
</script>

<template>
  <div>
    <p class="text-adm-md font-semibold text-secondary-900 mb-1.5">
      {{ label }}
      <span class="text-adm-sm font-normal text-secondary-400">
        · {{ hint }}
      </span>
    </p>
    <div
      class="border border-line rounded-adm-md px-4 py-4 bg-admin-bg flex items-center justify-center min-h-16"
    >
      <slot />
    </div>
  </div>
</template>
