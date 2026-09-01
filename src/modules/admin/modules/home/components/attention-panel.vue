<script setup lang="ts">
import { computed } from "vue";
import { HeroCore } from "@/shared/components";
import { mdiChevronRight } from "@mdi/js";
import type { AttentionItem } from "../models/dashboard.model";
import { ATTENTION_ROUTES } from "../constants/dashboard";

const props = defineProps<{
  items: AttentionItem[];
  loading?: boolean;
}>();

/** Clases literales por severidad (Tailwind no arma nombres en runtime). */
const SEVERITY = {
  critical: {
    badge: "bg-danger-soft text-danger-DEFAULT",
    label: "Urgente",
  },
  warning: {
    badge: "bg-amber-soft text-amber-DEFAULT",
    label: "Revisar",
  },
  info: {
    badge: "bg-info-soft text-info-DEFAULT",
    label: "Pendiente",
  },
} as const;

const criticalCount = computed(
  () => props.items.filter((item) => item.severity === "critical").length,
);
</script>

<template>
  <section
    class="bg-surface-paper border border-line rounded-adm-lg overflow-hidden shadow-sm"
  >
    <header
      class="px-5.5 py-4 border-b border-line-soft flex items-center justify-between gap-3"
    >
      <div class="flex items-center gap-3">
        <h3
          class="font-display text-adm-lg font-bold text-secondary-900 tracking-tight"
        >
          Requiere tu atención
        </h3>
        <span
          v-if="criticalCount"
          class="font-mono text-adm-label font-bold text-danger-DEFAULT bg-danger-soft px-2 py-0.5 rounded-pill tracking-wider"
        >
          {{ criticalCount }} {{ criticalCount === 1 ? "URGENTE" : "URGENTES" }}
        </span>
      </div>
    </header>

    <div v-if="loading" class="px-5.5 py-8 text-adm-base text-secondary-400">
      Cargando…
    </div>

    <!-- Sin asuntos abiertos es una buena noticia, no un vacío -->
    <div
      v-else-if="!items.length"
      class="px-5.5 py-8 text-center text-adm-base text-secondary-500"
    >
      Nada pendiente por ahora. Todo en orden.
    </div>

    <component
      :is="ATTENTION_ROUTES[item.key] ? 'router-link' : 'div'"
      v-for="(item, index) in items"
      v-else
      :key="item.key"
      :to="ATTENTION_ROUTES[item.key]"
      class="px-5.5 py-4 flex items-center gap-4 no-underline"
      :class="[
        index < items.length - 1 ? 'border-b border-line-soft' : '',
        ATTENTION_ROUTES[item.key] ? 'adm-row cursor-pointer' : '',
      ]"
    >
      <span
        class="min-w-8.5 h-8.5 px-1.5 rounded-adm-sm inline-flex items-center justify-center shrink-0 font-display text-[0.938rem] font-extrabold"
        :class="SEVERITY[item.severity].badge"
      >
        {{ item.count }}
      </span>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2.5 flex-wrap">
          <span class="text-adm-md font-bold text-secondary-900">
            {{ item.title }}
          </span>
          <span
            class="font-mono text-[0.563rem] font-bold px-1.5 py-0.5 rounded-adm-sm tracking-[0.07em] uppercase"
            :class="SEVERITY[item.severity].badge"
          >
            {{ SEVERITY[item.severity].label }}
          </span>
        </div>
        <div class="text-adm-sm text-secondary-500 mt-1">
          {{ item.detail }}
        </div>
      </div>

      <HeroCore
        v-if="ATTENTION_ROUTES[item.key]"
        :path="mdiChevronRight"
        class="size-4 text-primary-500 shrink-0"
      />
    </component>
  </section>
</template>
