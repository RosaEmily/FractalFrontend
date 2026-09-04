<script setup lang="ts">
/**
 * Casilla del sistema.
 *
 * El diseño la define en `aula/shell.jsx` como `AulaCheck` y prohíbe
 * explícitamente `<input type="checkbox">`: el nativo no se puede estilar de
 * forma consistente entre navegadores. Es un `<button role="checkbox">`.
 */
withDefaults(
  defineProps<{ label: string; hint?: string | null; on?: boolean }>(),
  { on: false },
);

defineEmits<{ toggle: [value: boolean] }>();
</script>

<template>
  <button
    type="button"
    role="checkbox"
    :aria-checked="on"
    class="inline-flex cursor-pointer items-start gap-2.5 text-left"
    @click="$emit('toggle', !on)"
  >
    <span
      class="mt-px grid size-[1.188rem] shrink-0 place-items-center rounded-[0.313rem] border-[1.5px] transition-colors"
      :class="on ? 'border-primary-500 bg-primary-500' : 'border-line bg-surface-paper'"
    >
      <svg
        v-if="on"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        stroke-width="3.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12.5L10 17.5L19 7" />
      </svg>
    </span>

    <span>
      <span class="block text-adm-sm text-secondary-900">{{ label }}</span>
      <span v-if="hint" class="mt-0.5 block text-adm-xs text-secondary-400">
        {{ hint }}
      </span>
    </span>
  </button>
</template>
