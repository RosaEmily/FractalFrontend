<script setup lang="ts">
export interface ReportTotal {
  label: string;
  value: string | number;
  hint?: string | null;
  /** Tono del número; por defecto el ink del diseño. */
  tone?: "default" | "success" | "danger" | "warning";
}

defineProps<{ items: ReportTotal[] }>();

/** Clases literales: Tailwind no arma nombres en runtime. */
const TONES = {
  default: "text-secondary-900",
  success: "text-success-DEFAULT",
  danger: "text-danger-DEFAULT",
  warning: "text-amber-DEFAULT",
} as const;
</script>

<template>
  <section class="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4 mb-3.5">
    <div
      v-for="item in items"
      :key="item.label"
      class="bg-surface-paper border border-line rounded-adm-lg px-5 py-4.5 shadow-sm"
    >
      <span
        class="font-mono text-adm-label text-secondary-400 tracking-wider uppercase"
      >
        {{ item.label }}
      </span>
      <div
        class="font-display text-[1.875rem] font-extrabold leading-none tracking-tight mt-2.5"
        :class="TONES[item.tone ?? 'default']"
      >
        {{ item.value }}
      </div>
      <div v-if="item.hint" class="text-adm-sm text-secondary-400 mt-1.5">
        {{ item.hint }}
      </div>
    </div>
  </section>
</template>
