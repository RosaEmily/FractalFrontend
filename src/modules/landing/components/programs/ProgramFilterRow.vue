<script setup lang="ts">
/**
 * Fila de filtro del landing (checkbox cuadrado + conteo a la derecha).
 *
 * Calca `V3FilterRow` del diseño: checkbox de 17px con check blanco cuando
 * está marcado, label a la izquierda, conteo en mono/gris a la derecha. No es
 * `ToggleCheck` (ese es el checkbox del ADMIN, otro sistema de tokens).
 */
defineProps<{
  label: string;
  count: number;
  checked: boolean;
}>();

defineEmits<{ toggle: [] }>();
</script>

<template>
  <label
    class="flex items-center justify-between font-body text-[0.844rem] text-secondary-900 cursor-pointer py-0.5"
    @click.prevent="$emit('toggle')"
  >
    <span class="flex items-center gap-2.5">
      <span
        class="w-[1.063rem] h-[1.063rem] rounded-[0.188rem] border-[1.5px] shrink-0 inline-flex items-center justify-center transition-colors"
        :class="checked ? 'border-primary-500 bg-primary-500' : 'border-line bg-surface-paper'"
      >
        <svg v-if="checked" width="9" height="9" viewBox="0 0 9 9">
          <path d="M1 4.5L3.5 7L8 1.5" stroke="#FFF" stroke-width="1.7" fill="none" />
        </svg>
      </span>
      {{ label }}
    </span>
    <span class="font-mono text-[0.6875rem] text-secondary-400">{{ count }}</span>
  </label>
</template>
