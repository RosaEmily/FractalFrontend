<script setup lang="ts">
/**
 * Cómo se ve el banner en el carrusel principal de la landing.
 *
 * Reproduce el marcado real de `landing/components/BannerSection.vue`
 * (tag, kicker, título con acento, sub, CTAs y la barra de meta) en vez de
 * un mockup aparte, para que el admin vea el resultado real antes de
 * publicar. El `meta` en vivo (antes de guardar) lo arma la página que usa
 * este preview a partir de la oferta seleccionada — acá solo se pinta.
 */
import { computed } from "vue";
import { parseBannerTitle } from "@/shared/utils/banner-title";
import type { BannerMeta } from "../models/banner.model";

const props = defineProps<{
  image: string | null;
  tag: string | null;
  kicker: string | null;
  title: string | null;
  sub: string | null;
  cta: string | null;
  cta2: string | null;
  dark: boolean;
  meta: BannerMeta | null;
}>();

const titleParts = computed(() => parseBannerTitle(props.title));

const metaEntries = computed<[string, string][]>(() => {
  if (!props.meta) return [];
  const { inicia, duracion, cupos, precio } = props.meta;
  const entries: [string, string][] = [];
  if (inicia) entries.push(["Inicia", inicia]);
  if (duracion) entries.push(["Duración", duracion]);
  if (cupos) entries.push(["Cupos", cupos]);
  if (precio) entries.push(["Precio", precio]);
  return entries;
});
</script>

<template>
  <div
    class="relative overflow-hidden rounded-adm-md border border-line transition-colors"
    :class="props.dark ? 'bg-primary-500' : 'bg-surface-cream'"
  >
    <div class="relative px-5 pt-7 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <div>
        <div class="flex items-center gap-2 mb-3 flex-wrap">
          <span
            class="inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-adm-xs font-semibold uppercase tracking-wide"
            :class="props.dark ? 'bg-surface-paper text-secondary-900' : 'bg-secondary-900 text-surface-paper'"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-primary-500" />
            {{ props.tag || "Etiqueta del banner" }}
          </span>
          <span
            class="font-mono text-adm-xs font-semibold tracking-widest uppercase"
            :class="props.dark ? 'text-white/80' : 'text-secondary-500'"
          >
            {{ props.kicker || "Texto secundario" }}
          </span>
        </div>

        <h2 class="font-display font-bold leading-none tracking-tight text-[1.75rem]">
          <template v-if="titleParts.length">
            <span
              v-for="(part, i) in titleParts"
              :key="i"
              class="block"
              :class="part.accent
                ? (props.dark ? 'text-accent-tint' : 'text-primary-500 italic')
                : (props.dark ? 'text-white' : 'text-secondary-900')"
            >{{ part.text }}</span>
          </template>
          <span v-else class="block" :class="props.dark ? 'text-white/60' : 'text-secondary-400'">
            Título del banner
          </span>
        </h2>

        <p
          class="font-body text-[0.813rem] leading-relaxed mt-3 mb-4 max-w-md"
          :class="props.dark ? 'text-white/85' : 'text-secondary-500'"
        >
          {{ props.sub || "Subtítulo o descripción breve del banner." }}
        </p>

        <div class="flex flex-wrap gap-2">
          <span
            class="inline-flex items-center rounded-pill px-3.5 py-2 text-adm-sm font-semibold"
            :class="props.dark ? 'bg-surface-paper text-secondary-900' : 'bg-primary-500 text-surface-paper'"
          >
            {{ props.cta || "Botón principal" }}
          </span>
          <span
            class="inline-flex items-center rounded-pill px-3.5 py-2 text-adm-sm font-semibold border"
            :class="props.dark ? 'border-white text-white' : 'border-secondary-900 text-secondary-900'"
          >
            {{ props.cta2 || "Botón secundario" }}
          </span>
        </div>
      </div>

      <div class="relative h-32 rounded-adm-md overflow-hidden border border-line/50">
        <img
          v-if="props.image"
          :src="props.image"
          alt=""
          class="absolute inset-0 size-full object-cover"
        />
        <div
          v-else
          class="absolute inset-0 flex items-center justify-center text-adm-sm"
          :class="props.dark ? 'bg-white/8 text-white/60' : 'bg-accent-soft text-secondary-400'"
        >
          Imagen de escritorio
        </div>
      </div>
    </div>

    <div
      class="relative border-t px-5 py-3 flex flex-wrap gap-6"
      :class="props.dark ? 'border-white/20' : 'border-line'"
    >
      <template v-if="metaEntries.length">
        <div v-for="([label, value]) in metaEntries" :key="label">
          <p
            class="font-mono text-[0.563rem] tracking-widest uppercase"
            :class="props.dark ? 'text-white/60' : 'text-secondary-400'"
          >{{ label }}</p>
          <p
            class="font-display text-[0.938rem] font-bold tracking-tight mt-0.5"
            :class="props.dark ? 'text-white' : 'text-secondary-900'"
          >{{ value }}</p>
        </div>
      </template>
      <p
        v-else
        class="text-adm-sm"
        :class="props.dark ? 'text-white/60' : 'text-secondary-400'"
      >
        Sin oferta asociada — no se muestra información de inicio, duración, cupos ni precio.
      </p>
    </div>
  </div>
</template>
