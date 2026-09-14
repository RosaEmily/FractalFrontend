<script setup lang="ts">
/**
 * Conmutador Individual / Masivo de los formularios de alta.
 *
 * Es `AdmModeToggle` del diseño (`admin/components.jsx`). Solo se muestra al
 * CREAR: editar en lote no existe, se edita un registro concreto.
 *
 * ⚠️ No cambia campos dentro del mismo formulario — cambia de formulario
 * entero, igual que en el diseño. La página decide cuál renderiza.
 */
interface ModeOption {
  value: string;
  label: string;
}

const props = defineProps<{
  modelValue: string;
  options: ModeOption[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();
</script>

<template>
  <div class="adm-mode-toggle" role="group">
    <button
      v-for="option in props.options"
      :key="option.value"
      type="button"
      class="adm-mode-toggle__btn"
      :class="{ 'is-active': props.modelValue === option.value }"
      :aria-pressed="props.modelValue === option.value"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
