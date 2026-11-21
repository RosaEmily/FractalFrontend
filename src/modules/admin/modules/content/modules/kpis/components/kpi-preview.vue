<script setup lang="ts">
/**
 * Vista previa de una métrica con la tarjeta real del home (`KpiCard`). La
 * landing destaca en naranja la segunda de la fila, así que se muestran las
 * dos variantes: según su posición saldrá una u otra.
 */
import { computed } from "vue";
import KpiCard from "@/modules/landing/components/blocks/KpiCard.vue";
import { splitKpiFormat } from "@/modules/landing/composables/format";
import { kpiIcon } from "@/modules/landing/components/blocks/kpi-icons";
import LandingFrame from "../../../components/landing-frame.vue";

const props = defineProps<{
  number: number | null;
  format: string | null;
  description: string | null;
}>();

/* Igual que `landing/adapters/general.adapter.ts`: valor entero y formato partido en prefijo/sufijo. */
const value = computed(() => Math.floor(Number(props.number ?? 0)));
const parts = computed(() => splitKpiFormat(props.format));
const prefix = computed(() => parts.value.prefix || null);
const suffix = computed(() => parts.value.suffix || null);
const label = computed(() => props.description || "Descripción de la métrica");
</script>

<template>
  <LandingFrame :width="720">
    <div class="bg-surface-page p-6 grid grid-cols-2 gap-4">
      <KpiCard :value="value" :prefix="prefix" :suffix="suffix" :label="label" :svg-icon="kpiIcon(0)" />
      <KpiCard :value="value" :prefix="prefix" :suffix="suffix" :label="label" :svg-icon="kpiIcon(1)" accent />
    </div>
  </LandingFrame>
</template>
