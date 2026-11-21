<script setup lang="ts">
/**
 * Variación contra el periodo anterior: verde si subió, rojo si bajó y gris
 * cuando no hay con qué comparar (un 0% inventado se leería como "no cambió").
 * El texto del periodo ("vs. mes previo") va aparte, en gris, como en los
 * paneles de métricas habituales.
 */
defineProps<{
  percent: number | null;
  /** Qué se compara: "vs. mes previo", "vs. periodo anterior". */
  suffix?: string;
}>();
</script>

<template>
  <span class="inline-flex items-center gap-1.5 flex-wrap">
    <span
      v-if="percent === null"
      class="font-mono text-adm-label font-semibold px-1.5 py-0.5 rounded-pill bg-admin-bg text-secondary-500"
    >
      Sin comparación
    </span>
    <span
      v-else
      class="font-mono text-adm-label font-bold px-1.5 py-0.5 rounded-pill"
      :class="
        percent >= 0
          ? 'bg-success-soft text-success-DEFAULT'
          : 'bg-danger-soft text-danger-DEFAULT'
      "
    >
      {{ percent >= 0 ? "▲" : "▼" }} {{ Math.abs(percent) }}%
    </span>
    <span v-if="suffix && percent !== null" class="text-adm-label text-secondary-400">
      {{ suffix }}
    </span>
  </span>
</template>
