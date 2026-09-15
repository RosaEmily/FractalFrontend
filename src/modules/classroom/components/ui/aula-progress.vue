<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    value: number | null;
    /** Barra secundaria (peso evaluado) en azul, la principal en accent. */
    tone?: "accent" | "info" | "success";
    showLabel?: boolean;
  }>(),
  { tone: "accent", showLabel: false },
);

/** Sin dato la barra queda vacía, y el 100% no se desborda. */
const width = computed(() =>
  Math.max(0, Math.min(100, props.value ?? 0)),
);

const TONES: Record<string, string> = {
  accent: "bg-primary-500",
  info: "bg-info-DEFAULT",
  success: "bg-success-DEFAULT",
};
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="flex-1 h-1.5 rounded-pill bg-control-off overflow-hidden">
      <div
        class="h-full rounded-pill transition-[width] duration-300"
        :class="TONES[tone]"
        :style="{ width: `${width}%` }"
      />
    </div>
    <span
      v-if="showLabel"
      class="font-mono text-adm-xs text-secondary-400 shrink-0"
    >
      {{ value === null ? "—" : `${width}%` }}
    </span>
  </div>
</template>
