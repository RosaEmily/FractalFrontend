<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    tone?: "neutral" | "accent" | "success" | "warning" | "danger" | "info";
    size?: "sm" | "md";
  }>(),
  { tone: "neutral", size: "md" },
);

/*
 * Las clases van literales en el mapa, nunca interpoladas: Tailwind no detecta
 * nombres construidos en runtime y la regla no se generaría.
 */
const TONES: Record<string, string> = {
  neutral: "bg-surface-soft text-secondary-500 border-line",
  accent: "bg-accent-soft text-primary-500 border-accent-tint",
  success: "bg-success-soft text-success-DEFAULT border-success-DEFAULT/25",
  warning: "bg-amber-soft text-amber-DEFAULT border-amber-DEFAULT/25",
  danger: "bg-danger-soft text-danger-DEFAULT border-danger-DEFAULT/25",
  info: "bg-info-soft text-info-DEFAULT border-info-DEFAULT/25",
};

const toneClass = computed(() => TONES[props.tone] ?? TONES.neutral);

const sizeClass = computed(() =>
  props.size === "sm"
    ? "text-adm-xs px-1.5 py-0.5"
    : "text-adm-sm px-2 py-0.5",
);
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-pill border font-medium whitespace-nowrap"
    :class="[toneClass, sizeClass]"
  >
    <slot />
  </span>
</template>
