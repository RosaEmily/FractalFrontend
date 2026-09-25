<script setup lang="ts">
import { computed } from "vue";

export type PillTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent"
  | "neutral";

interface Props {
  label: string;
  tone?: PillTone;
  /** Punto de color a la izquierda, como en AdmStatusPago del diseño. */
  dot?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  tone: "neutral",
  dot: true,
});

const TONES: Record<PillTone, string> = {
  success: "bg-success-soft text-success-DEFAULT",
  warning: "bg-amber-soft text-amber-DEFAULT",
  danger: "bg-danger-soft text-danger-DEFAULT",
  info: "bg-info-soft text-info-DEFAULT",
  /*
   * Acento del sistema, equivalente al `variant="soft"` del diseño. Faltaba, y
   * por eso las etiquetas de categoría acababan en `info` (AZUL), que en la
   * paleta cálida de Fractal desentona: el azul está reservado para lo
   * informativo, no para clasificar.
   */
  accent: "bg-accent-soft text-primary-600",
  neutral: "bg-admin-pane text-secondary-400",
};

const toneClass = computed(() => TONES[props.tone]);
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-adm-sm font-semibold whitespace-nowrap"
    :class="toneClass"
  >
    <span v-if="dot" class="w-1.5 h-1.5 rounded-full bg-current" />
    {{ label }}
  </span>
</template>
