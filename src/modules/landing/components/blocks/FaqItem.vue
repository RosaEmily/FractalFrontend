<script setup lang="ts">
/**
 * Una pregunta frecuente (acordeón). Compartida por la página de contacto de
 * la landing y la vista previa del panel (Sitio web → FAQ).
 */
defineProps<{ question: string; answer: string; open: boolean }>();
defineEmits<{ (e: "toggle"): void }>();
</script>

<template>
  <div
    class="bg-surface-paper rounded-lg px-6 py-5 transition-all duration-200"
    :class="open ? 'border border-primary-500 shadow-sm' : 'border border-line'"
  >
    <button
      type="button"
      class="w-full flex items-center justify-between gap-4 text-left"
      :aria-expanded="open"
      @click="$emit('toggle')"
    >
      <span class="font-display text-[1.0625rem] font-semibold text-secondary-900 tracking-tight">{{ question }}</span>
      <span
        class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-250"
        :class="open ? 'bg-primary-500 text-white rotate-45' : 'bg-surface-page text-secondary-900 border border-line'"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 5V19M5 12H19" />
        </svg>
      </span>
    </button>
    <p v-if="open" class="font-body text-[0.906rem] text-secondary-500 leading-relaxed mt-3.5 max-w-3xl">
      {{ answer }}
    </p>
  </div>
</template>
