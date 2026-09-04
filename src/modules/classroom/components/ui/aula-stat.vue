<script setup lang="ts">
import { HeroCore } from "@/shared/components";

withDefaults(
  defineProps<{
    label: string;
    /** Ya formateado por quien lo usa: "—" cuando no hay dato, nunca "0". */
    value: string | number;
    icon?: string;
    /** Contexto del número, no otro número. Va arriba, junto al icono. */
    delta?: string;
    tone?: "accent" | "success" | "warning" | "danger" | "info";
  }>(),
  { tone: "accent" },
);

/*
 * Las clases van literales: Tailwind no detecta nombres construidos en runtime.
 * El fondo es el tono al 18% de opacidad, como en el diseño.
 */
const TONES: Record<string, string> = {
  accent: "bg-accent-soft text-primary-500",
  success: "bg-success-soft text-success-DEFAULT",
  warning: "bg-amber-soft text-amber-DEFAULT",
  danger: "bg-danger-soft text-danger-DEFAULT",
  info: "bg-info-soft text-info-DEFAULT",
};
</script>

<template>
  <div
    class="bg-surface-paper border border-line rounded-adm-lg shadow-sm p-5"
  >
    <!-- Icono e indicador arriba; el número manda debajo -->
    <div class="flex items-start justify-between gap-2">
      <span
        v-if="icon"
        class="size-10.5 shrink-0 rounded-adm-md inline-flex items-center justify-center"
        :class="TONES[tone]"
      >
        <HeroCore :path="icon" class="size-5" />
      </span>
      <span
        v-if="delta"
        class="font-mono text-adm-xs text-secondary-400 text-right max-w-25 leading-snug"
      >
        {{ delta }}
      </span>
    </div>

    <div
      class="font-display text-3xl font-extrabold tracking-tight text-secondary-900 leading-none"
      :class="icon || delta ? 'mt-4' : ''"
    >
      {{ value }}
    </div>
    <div class="text-adm-base text-secondary-500 mt-1.5">
      {{ label }}
    </div>
  </div>
</template>
