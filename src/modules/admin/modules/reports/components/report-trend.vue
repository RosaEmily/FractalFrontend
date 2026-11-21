<script setup lang="ts">
import { computed } from "vue";

/**
 * Cobrado por mes, una fila de barras por moneda. Cada moneda tiene su propia
 * escala: comparar 8,000 pesos con 400 dólares en una misma altura no dice nada.
 */
interface Point {
  period: string;
  label: string;
  paid: number;
  formatted: string;
  payments: number;
  currency: string | null;
  symbol: string | null;
}

const props = defineProps<{ points: Point[] }>();

const groups = computed(() => {
  const byCurrency = new Map<string, Point[]>();
  for (const point of props.points) {
    const key = point.currency ?? "—";
    byCurrency.set(key, [...(byCurrency.get(key) ?? []), point]);
  }

  return [...byCurrency.entries()].map(([currency, points]) => {
    const max = Math.max(...points.map((p) => p.paid), 0);
    return {
      currency,
      symbol: points[0]?.symbol ?? "",
      points: points.map((p) => ({
        ...p,
        // Un mes sin cobro se dibuja como una marca mínima, no como un hueco.
        height: max > 0 ? Math.max(3, Math.round((p.paid * 100) / max)) : 3,
        empty: p.paid <= 0,
      })),
    };
  });
});
</script>

<template>
  <div class="px-5.5 py-4.5 flex flex-col gap-6">
    <div v-for="group in groups" :key="group.currency">
      <div class="flex items-center gap-2 mb-3">
        <span
          class="font-mono text-adm-sm font-bold text-primary-500 bg-accent-soft px-2 py-0.5 rounded-adm-sm"
        >
          {{ group.symbol }}
        </span>
      </div>

      <div class="flex items-end gap-2 h-36">
        <div
          v-for="point in group.points"
          :key="point.period"
          class="flex-1 min-w-0 h-full flex flex-col justify-end items-center gap-1.5"
          v-tooltip.top="{
            value: `${point.label}: ${point.formatted} · ${point.payments} ${point.payments === 1 ? 'pago' : 'pagos'}`,
            anchor: '[data-bar]',
          }"
        >
          <span
            class="font-mono text-[0.625rem] leading-none text-secondary-500 truncate max-w-full"
            :class="point.empty ? 'opacity-0' : ''"
          >
            {{ point.formatted }}
          </span>
          <div
            data-bar
            class="w-full max-w-14 rounded-t-adm-sm"
            :class="point.empty ? 'bg-line' : 'bg-primary-500'"
            :style="{ height: `${point.height}%` }"
          />
        </div>
      </div>

      <div class="flex gap-2 mt-2 border-t border-line-soft pt-1.5">
        <span
          v-for="point in group.points"
          :key="point.period"
          class="flex-1 min-w-0 text-center font-mono text-adm-label text-secondary-400 truncate"
        >
          {{ point.label }}
        </span>
      </div>
    </div>
  </div>
</template>
