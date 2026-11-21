<script setup lang="ts">
import DeltaPill from "@/modules/admin/components/ui/delta-pill.vue";

export interface ReportTotal {
  label: string;
  value: string | number;
  hint?: string | null;
  /** Variación del valor principal contra el periodo anterior, como indicador de color. */
  change?: { percent: number | null; suffix: string };
  /** Moneda del valor principal ("Sol peruano"), cuando hay más de una. */
  valueLabel?: string | null;
  /** Montos de otras monedas, cada uno en su fila con su variación (nunca sumados al principal). */
  extra?: { label?: string | null; text: string; percent?: number | null }[];
  /** Tono del número; por defecto el ink del diseño. */
  tone?: "default" | "success" | "danger" | "warning";
}

defineProps<{
  items: ReportTotal[];
  /** Esqueleto con las 4 tarjetas mientras llega el reporte. */
  loading?: boolean;
}>();

/** Clases literales: Tailwind no arma nombres en runtime. */
const TONES = {
  default: "text-secondary-900",
  success: "text-success-DEFAULT",
  danger: "text-danger-DEFAULT",
  warning: "text-amber-DEFAULT",
} as const;
</script>

<template>
  <section
    v-if="loading && !items.length"
    class="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4 mb-3.5"
    aria-busy="true"
    aria-label="Cargando totales"
  >
    <div
      v-for="n in 4"
      :key="n"
      class="bg-surface-paper border border-line rounded-adm-lg px-5 py-4.5 shadow-sm"
    >
      <span class="adm-skeleton block h-3 w-1/2 rounded-[0.313rem]" />
      <span class="adm-skeleton block h-7.5 w-3/5 rounded-adm-sm mt-3" />
      <span class="adm-skeleton block h-3 w-4/5 rounded-[0.313rem] mt-2.5" />
    </div>
  </section>

  <section v-else class="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4 mb-3.5">
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
      <div v-if="item.valueLabel" class="text-adm-sm text-secondary-400 mt-1">
        {{ item.valueLabel }}
      </div>
      <div v-if="item.change" class="mt-2">
        <DeltaPill :percent="item.change.percent" :suffix="item.change.suffix" />
      </div>
      <div v-else-if="item.hint" class="text-adm-sm text-secondary-400 mt-1.5">
        {{ item.hint }}
      </div>
      <ul
        v-if="item.extra?.length"
        class="list-none m-0 mt-3.5 pt-3 border-t border-line-soft flex flex-col gap-3"
      >
        <li
          v-for="line in item.extra"
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
            <DeltaPill
              v-if="line.percent !== undefined"
              class="mt-1"
              :percent="line.percent"
              :suffix="item.change?.suffix"
            />
          </div>
          <span
            class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight shrink-0"
          >
            {{ line.text }}
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>
