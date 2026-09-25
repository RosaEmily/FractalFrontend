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
/*
 * ⚠️ SIN borde: el diseño (`shell.jsx` → `AulaPill`) solo usa fondo suave y
 * texto del mismo tono. El borde que tenía antes engordaba la píldora y la
 * hacía competir con los botones.
 */
const TONES: Record<string, string> = {
  neutral: "bg-surface-cream text-secondary-500",
  accent: "bg-accent-soft text-primary-600",
  success: "bg-success-soft text-success-DEFAULT",
  warning: "bg-amber-soft text-amber-DEFAULT",
  danger: "bg-danger-soft text-danger-DEFAULT",
  info: "bg-info-soft text-info-DEFAULT",
};

const toneClass = computed(() => TONES[props.tone] ?? TONES.neutral);

/* Medidas del diseño: sm = 3px 8px / 10.5px · md = 5px 11px / 11.5px. */
const sizeClass = computed(() =>
  props.size === "sm"
    ? "text-[0.656rem] px-2 py-[0.188rem]"
    : "text-[0.719rem] px-2.5 py-[0.313rem]",
);
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-pill font-mono font-semibold uppercase tracking-[0.03em] whitespace-nowrap"
    :class="[toneClass, sizeClass]"
  >
    <slot />
  </span>
</template>
