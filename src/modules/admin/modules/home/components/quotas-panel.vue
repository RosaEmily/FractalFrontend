<script setup lang="ts">
import dayjs from "dayjs";
import type { Quota } from "../models/dashboard.model";

defineProps<{
  items: Quota[];
  loading?: boolean;
}>();

/** Clases literales por estado del cupo. */
const STATE_TEXT = {
  ok: "text-secondary-400",
  below_min: "text-amber-DEFAULT font-semibold",
  over_max: "text-danger-DEFAULT font-semibold",
} as const;

const STATE_BAR = {
  ok: "bg-success-DEFAULT",
  below_min: "bg-amber-DEFAULT",
  over_max: "bg-danger-DEFAULT",
} as const;

const quotaMessage = (quota: Quota): string => {
  if (quota.state === "over_max") {
    return `Excede el cupo en ${quota.enrolled - quota.max}`;
  }
  if (quota.state === "below_min") {
    const missing = quota.min - quota.enrolled;
    return `${missing === 1 ? "Falta" : "Faltan"} ${missing} para el mínimo`;
  }
  return "Cupo mínimo cubierto";
};

const closesAt = (date: string | null) =>
  date ? ` · cierra ${dayjs(date).format("DD/MM/YYYY")}` : "";
</script>

<template>
  <div
    class="bg-surface-paper border border-line rounded-adm-lg overflow-hidden shadow-sm h-full"
  >
    <header class="px-5.5 py-4 border-b border-line-soft">
      <h3
        class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight"
      >
        Cupo de cohortes abiertas
      </h3>
      <p class="text-adm-sm text-secondary-400 mt-0.5">
        Matriculados sobre el máximo · la marca es el mínimo para arrancar
      </p>
    </header>

    <div v-if="loading" class="px-5.5 py-8 text-adm-base text-secondary-400">
      Cargando…
    </div>

    <div
      v-else-if="!items.length"
      class="px-5.5 py-8 text-center text-adm-base text-secondary-500"
    >
      No hay cohortes con matrícula abierta.
    </div>

    <div v-else class="px-5.5 pb-4.5">
      <div
        v-for="(quota, index) in items"
        :key="quota.id"
        class="py-3.5"
        :class="index < items.length - 1 ? 'border-b border-line-soft' : ''"
      >
        <div class="flex justify-between items-baseline gap-2.5 mb-2">
          <span
            class="text-adm-sm font-semibold text-secondary-900 truncate"
            :title="quota.name"
          >
            {{ quota.name }}
          </span>
          <span
            class="font-mono text-adm-sm font-bold shrink-0"
            :class="STATE_TEXT[quota.state]"
          >
            {{ quota.enrolled }}/{{ quota.max }}
          </span>
        </div>

        <div class="relative h-1.75 bg-admin-bg rounded-pill">
          <div class="absolute inset-0 rounded-pill overflow-hidden">
            <div
              class="h-full rounded-pill"
              :class="STATE_BAR[quota.state]"
              :style="{ width: `${quota.percent}%` }"
            />
          </div>
          <!-- Marca del mínimo: sobresale de la barra a propósito -->
          <span
            v-if="quota.min > 0"
            class="absolute -top-1 w-0.5 h-3.25 bg-secondary-900 opacity-45 rounded-pill"
            :style="{ left: `${quota.minPercent}%` }"
          />
        </div>

        <div class="text-adm-sm mt-1.5" :class="STATE_TEXT[quota.state]">
          {{ quotaMessage(quota) }}{{ closesAt(quota.closesAt) }}
        </div>
      </div>
    </div>
  </div>
</template>
