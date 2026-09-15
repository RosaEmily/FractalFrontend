<script setup lang="ts">
const props = defineProps<{
  /** null = sin datos; se muestra el texto de vacío en vez de la barra. */
  percent: number | null;
  /** Debajo de este valor la barra pasa a ámbar. */
  threshold?: number;
  emptyLabel?: string;
}>();

const tone = (percent: number) =>
  percent >= (props.threshold ?? 90) ? "bg-success-DEFAULT" : "bg-amber-DEFAULT";
</script>

<template>
  <span
    v-if="percent === null"
    class="text-adm-sm text-amber-DEFAULT font-semibold"
  >
    {{ emptyLabel ?? "Sin datos" }}
  </span>

  <div v-else class="flex items-center gap-2.25">
    <div class="flex-1 h-1.5 bg-admin-bg rounded-pill overflow-hidden">
      <div
        class="h-full rounded-pill"
        :class="tone(percent)"
        :style="{ width: `${Math.min(100, percent)}%` }"
      />
    </div>
    <span class="font-mono text-adm-sm text-secondary-500 min-w-8 text-right">
      {{ Math.round(percent) }}%
    </span>
  </div>
</template>
