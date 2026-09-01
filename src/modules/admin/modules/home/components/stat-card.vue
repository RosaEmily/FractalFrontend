<script setup lang="ts">
import { HeroCore } from "@/shared/components";

defineProps<{
  icon: string;
  value: string | number;
  label: string;
  /** Línea inferior en mono: la comparación o el contexto del número. */
  hint?: string | null;
  /** Tono del icono; el diseño usa uno distinto por métrica. */
  tone?: "accent" | "success" | "info" | "amber";
}>();

/**
 * Las clases van literales: Tailwind no detecta nombres construidos en
 * runtime, así que `bg-${tone}-soft` no generaría CSS.
 */
const TONES = {
  accent: "bg-accent-soft text-primary-500",
  success: "bg-success-soft text-success-DEFAULT",
  info: "bg-info-soft text-info-DEFAULT",
  amber: "bg-amber-soft text-amber-DEFAULT",
} as const;
</script>

<template>
  <div
    class="bg-surface-paper border border-line rounded-adm-lg px-5 pt-5 pb-4.5 shadow-sm"
  >
    <span
      class="size-8.5 rounded-adm-sm inline-flex items-center justify-center mb-3.5"
      :class="TONES[tone ?? 'accent']"
    >
      <HeroCore :path="icon" class="size-4.5" />
    </span>

    <div
      class="font-display text-[2.125rem] font-extrabold text-secondary-900 leading-none tracking-tight"
    >
      {{ value }}
    </div>
    <div class="text-adm-base text-secondary-900 mt-2 font-semibold">
      {{ label }}
    </div>
    <div v-if="hint" class="font-mono text-adm-label text-secondary-400 mt-1">
      {{ hint }}
    </div>
  </div>
</template>
