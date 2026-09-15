<script setup lang="ts">
import { HeroCore } from "@/shared/components";
import { mdiLinkVariant } from "@mdi/js";
import type { ClassToday } from "../models/dashboard.model";
import { CLASS_STATE_LABELS } from "../constants/dashboard";

defineProps<{
  items: ClassToday[];
  loading?: boolean;
}>();

/** Clases literales por estado: Tailwind no arma nombres en runtime. */
const STATE_TONES = {
  done: "bg-line-soft text-secondary-400",
  in_progress: "bg-success-soft text-success-DEFAULT",
  upcoming: "bg-accent-soft text-primary-500",
} as const;

const STATE_BARS = {
  done: "bg-secondary-400",
  in_progress: "bg-success-DEFAULT",
  upcoming: "bg-primary-500",
} as const;

/** `09:00:00` → `09:00`. La API devuelve TIME con segundos. */
const shortTime = (time: string | null) => time?.slice(0, 5) ?? "--:--";
</script>

<template>
  <div
    class="bg-surface-paper border border-line rounded-adm-lg overflow-hidden shadow-sm h-full"
  >
    <header
      class="px-5.5 py-4 border-b border-line-soft flex items-center justify-between"
    >
      <h3
        class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight"
      >
        Clases de hoy
      </h3>
      <router-link
        :to="{ name: 'classSessions.list' }"
        class="text-adm-sm text-primary-500 font-semibold no-underline hover:underline"
      >
        Ver todas →
      </router-link>
    </header>

    <div v-if="loading" class="px-5.5 py-8 text-adm-base text-secondary-400">
      Cargando…
    </div>

    <div
      v-else-if="!items.length"
      class="px-5.5 py-8 text-center text-adm-base text-secondary-500"
    >
      No hay clases programadas para hoy.
    </div>

    <div
      v-for="(item, index) in items"
      v-else
      :key="item.id"
      class="px-5.5 py-3.5 flex items-center gap-4"
      :class="[
        index < items.length - 1 ? 'border-b border-line-soft' : '',
        item.state === 'done' ? 'opacity-60' : '',
      ]"
    >
      <div class="w-14 shrink-0">
        <div
          class="font-mono text-adm-md font-bold text-secondary-900 tracking-tight"
        >
          {{ shortTime(item.startTime) }}
        </div>
        <div class="font-mono text-adm-label text-secondary-400">
          {{ shortTime(item.endTime) }}
        </div>
      </div>

      <div
        class="w-0.75 self-stretch rounded-pill shrink-0 opacity-50"
        :class="STATE_BARS[item.state]"
      />

      <div class="flex-1 min-w-0">
        <div class="text-adm-base font-bold text-secondary-900 truncate">
          {{ item.course }}
          <span v-if="item.topic" class="font-medium text-secondary-400">
            · {{ item.topic }}
          </span>
        </div>
        <div class="text-adm-sm text-secondary-500 mt-0.5 truncate">
          {{ item.offer }}
          <template v-if="item.teacher"> · {{ item.teacher }}</template>
        </div>
      </div>

      <span
        class="font-mono text-[0.594rem] font-bold px-2 py-0.5 rounded-pill tracking-[0.06em] uppercase shrink-0"
        :class="STATE_TONES[item.state]"
      >
        {{ CLASS_STATE_LABELS[item.state] }}
      </span>

      <a
        v-if="item.meetLink && item.state !== 'done'"
        :href="item.meetLink"
        target="_blank"
        rel="noopener noreferrer"
        class="adm-icon-btn size-8 rounded-adm-sm inline-flex items-center justify-center text-secondary-500 shrink-0"
        title="Abrir la videollamada"
      >
        <HeroCore :path="mdiLinkVariant" class="size-4" />
      </a>
    </div>
  </div>
</template>
