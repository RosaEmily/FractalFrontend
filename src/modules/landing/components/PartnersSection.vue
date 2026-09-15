<script setup lang="ts">
import { computed } from "vue";
import type { Partner } from "@/modules/landing/models/general.model";

const props = defineProps<{ partners: Partner[]; skeleton: boolean }>();

const SPONSOR_COLORS = ["#E94E1B", "#F5A623", "#2D9A7D", "#2D6FCF"];

const colWidth = computed(() => {
  const n = props.partners.length;
  if (n >= 6) return "25%";
  if (n === 5) return "33.333%";
  if (n === 4) return "25%";
  if (n === 3) return "33.333%";
  if (n === 2) return "50%";
  return "100%";
});
</script>

<template>
  <section class="bg-surface-paper py-20">
    <div class="px-6 md:px-16">
      <!-- Header row -->
      <div
        class="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8"
      >
        <div>
          <p
            class="font-mono text-[0.6875rem] tracking-widest uppercase text-secondary-400 mb-3"
          >
            PATROCINADORES · EMPRESAS QUE CONFÍAN
          </p>
          <h2
            class="font-display font-bold text-[clamp(28px,3.5vw,36px)] leading-[1.1] tracking-tight text-secondary-900 max-w-lg"
          >
            Empresas que contratan a nuestros egresados.
          </h2>
        </div>
      </div>

      <!-- Sponsors grid — text names in bordered cells -->
      <div class="border border-line rounded-lg overflow-hidden">
        <div class="flex flex-wrap">
          <div
            v-for="(sponsor, i) in partners"
            :key="sponsor.id"
            class="bg-surface-paper flex items-center justify-center min-h-28 px-6 py-8 border-b border-r border-line"
            :style="{ width: colWidth }"
          >
            <div class="flex items-center gap-2.5 font-display font-extrabold text-[1.25rem] text-secondary-900 tracking-tight opacity-70">
              <span class="w-3.5 h-3.5 rotate-45 shrink-0" :style="{ background: SPONSOR_COLORS[i % 4] }" />
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
