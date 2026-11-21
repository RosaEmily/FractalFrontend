<script setup lang="ts">
/**
 * Vista previa de la nota bajo "Enviar consulta" en Contacto, con el mismo
 * botón y el mismo texto pequeño que la landing (`ContactView`).
 */
import LandingFrame from "../../../components/landing-frame.vue";

defineProps<{ note: string | null }>();
</script>

<template>
  <LandingFrame :width="560">
    <div class="bg-surface-paper p-8 flex flex-col gap-3">
      <div
        class="w-full flex items-center justify-between px-6 py-4 bg-primary-500 text-white font-body text-[0.9375rem] font-semibold rounded-lg"
      >
        Enviar consulta
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 8H13M9 4L13 8L9 12" />
        </svg>
      </div>
      <p class="font-body text-[0.719rem] text-secondary-400 text-center">
        {{ note || "Te responderemos en menos de 24 horas hábiles." }}
      </p>
    </div>
  </LandingFrame>
</template>
