<script setup lang="ts">
import { computed } from "vue";
import type { Partner } from "@/modules/landing/models/general.model";
import LandingEyebrow from "./ui/LandingEyebrow.vue";

const props = defineProps<{ partners: Partner[]; skeleton: boolean }>();

const SPONSOR_COLORS = ["#E94E1B", "#F5A623", "#2D9A7D", "#2D6FCF"];

/*
 * 2 columnas en móvil, 3 en tablet y hasta 4 en escritorio (diseño v4), sin
 * pasarse del número de empresas. Clases literales: Tailwind no ve las
 * construidas en runtime.
 */
const COLS = {
  base: ["grid-cols-1", "grid-cols-2"],
  md: ["md:grid-cols-1", "md:grid-cols-2", "md:grid-cols-3"],
  lg: ["lg:grid-cols-1", "lg:grid-cols-2", "lg:grid-cols-3", "lg:grid-cols-4"],
} as const;

const gridCols = computed(() => {
  const n = Math.max(1, props.partners.length);
  return [
    COLS.base[Math.min(n, 2) - 1],
    COLS.md[Math.min(n, 3) - 1],
    COLS.lg[Math.min(n, 4) - 1],
  ];
});
</script>

<template>
  <section v-if="partners.length" class="bg-surface-paper py-20">
    <div class="px-6 md:px-16">
      <!-- Header row -->
      <div
        class="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8"
      >
        <div>
          <LandingEyebrow :index="6">PATROCINADORES · EMPRESAS QUE CONFÍAN</LandingEyebrow>
          <h2
            class="mt-3.5 font-display font-bold text-[1.625rem] sm:text-[2rem] leading-[1.1] tracking-tight text-secondary-900 max-w-135"
          >
            Empresas que contratan a nuestros egresados.
          </h2>
        </div>
      </div>

      <!-- Sponsors grid — text names in bordered cells -->
      <!-- Líneas por celda (borde derecho e inferior) y la grilla corrida 1px
           para que el marco exterior las tape: así los huecos de la última
           fila quedan en blanco, no como un bloque del color de las líneas. -->
      <div class="border border-line rounded-lg overflow-hidden bg-surface-paper">
        <div class="grid -mr-px -mb-px" :class="gridCols">
        <div
          v-for="(sponsor, i) in partners"
          :key="sponsor.id"
          class="border-r border-b border-line flex items-center justify-center min-h-22 sm:min-h-28 px-4 py-6 sm:px-6 sm:py-9"
        >
          <div class="flex items-center gap-2.5 font-display font-extrabold text-base sm:text-[1.375rem] text-secondary-900 tracking-tight opacity-70 text-center">
            <span class="size-3 sm:size-3.5 rotate-45 shrink-0" :style="{ background: SPONSOR_COLORS[i % 4] }" />
            {{ sponsor.name }}
          </div>
        </div>
        </div>
      </div>

      <!-- Marquee of accreditations -->
      <div class="mt-14 pt-10 border-t border-line overflow-hidden">
        <p
          class="font-mono text-[0.625rem] tracking-widest uppercase text-secondary-400 text-center mb-6"
        >
          ACREDITACIONES OFICIALES
        </p>
        <div class="overflow-hidden">
          <div class="flex gap-16 animate-marquee w-max">
            <template v-for="loop in 3" :key="loop">
              <div
                v-for="partner in partners"
                :key="`${loop}-${partner.id}`"
                class="flex items-center opacity-70 shrink-0"
              >
                <img
                  :src="partner.image_url"
                  :alt="partner.name"
                  class="h-8 object-contain"
                />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
