<script setup lang="ts">
import { HeroCore } from "@/shared/components";
import DeltaPill from "@/modules/admin/components/ui/delta-pill.vue";

defineProps<{
  icon: string;
  value: string | number;
  label: string;
  /** Línea inferior en mono: la comparación o el contexto del número. */
  hint?: string | null;
  /** Tono del icono; el diseño usa uno distinto por métrica. */
  tone?: "accent" | "success" | "info" | "amber";
  /** Variación del valor principal (ingresos): se pinta como indicador de color. */
  change?: { percent: number | null; suffix: string };
  /** Moneda del valor principal ("Sol peruano"), cuando hay más de una. */
  valueLabel?: string | null;
  /** Otros montos en otras monedas: cada uno en su fila con su propia variación, nunca sumados al principal. */
  extra?: { label?: string | null; text: string; percent: number | null }[];
  /** Esqueleto con la misma forma de la tarjeta, para que no salte al cargar. */
  loading?: boolean;
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

    <template v-if="loading">
      <span class="adm-skeleton block h-8.5 w-3/5 rounded-adm-sm" />
      <span class="adm-skeleton block h-3.5 w-2/5 rounded-[0.313rem] mt-3" />
      <span class="adm-skeleton block h-3 w-4/5 rounded-[0.313rem] mt-2" />
    </template>

    <template v-else>
    <div
      class="font-display text-[2.125rem] font-extrabold text-secondary-900 leading-none tracking-tight"
    >
      {{ value }}
    </div>
    <div class="text-adm-base text-secondary-900 mt-2 font-semibold">
      {{ label }}
    </div>
    <div v-if="valueLabel" class="text-adm-sm text-secondary-400 mt-0.5">
      {{ valueLabel }}
    </div>
    <div v-if="change" class="mt-2">
      <DeltaPill :percent="change.percent" :suffix="change.suffix" />
    </div>
    <div v-else-if="hint" class="font-mono text-adm-label text-secondary-400 mt-1">
      {{ hint }}
    </div>
    <ul
      v-if="extra?.length"
      class="list-none m-0 mt-3.5 pt-3 border-t border-line-soft flex flex-col gap-3"
    >
      <li
        v-for="line in extra"
        :key="line.text"
        class="flex items-start justify-between gap-3"
      >
        <div class="min-w-0">
          <div
            v-if="line.label"
            class="text-adm-sm font-semibold text-secondary-700 truncate"
          >
            {{ line.label }}
          </div>
          <DeltaPill class="mt-1" :percent="line.percent" :suffix="change?.suffix" />
        </div>
        <span
          class="font-display text-adm-xl font-bold text-secondary-900 tracking-tight shrink-0"
        >
          {{ line.text }}
        </span>
      </li>
    </ul>
    </template>
  </div>
</template>
