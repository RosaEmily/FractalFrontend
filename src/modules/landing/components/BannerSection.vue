<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import LandingBadge from './ui/LandingBadge.vue'
import LandingButton from './ui/LandingButton.vue'
import IsoTower from './ui/IsoTower.vue'
import { parseBannerTitle } from '@/shared/utils/banner-title'
import type { Banner } from '@/modules/landing/models/general.model'

const props = defineProps<{ banner: Banner[]; skeleton: boolean }>()

const idx = ref(0)
const slide = computed(() => props.banner[idx.value] ?? null)
const titleParts = computed(() => parseBannerTitle(slide.value?.title))
const hasPhoto = computed(() => !!slide.value?.desktop)

const metaEntries = computed<[string, string][]>(() => {
  const meta = slide.value?.meta
  if (!meta) return []
  const { inicia, duracion, cupos, precio } = meta
  const entries: [string, string][] = []
  if (inicia) entries.push(['Inicia', inicia])
  if (duracion) entries.push(['Duración', duracion])
  if (cupos) entries.push(['Cupos', cupos])
  if (precio) entries.push(['Precio', precio])
  return entries
})

const prev = () => { idx.value = (idx.value - 1 + props.banner.length) % props.banner.length }
const next = () => { idx.value = (idx.value + 1) % props.banner.length }

let timer: ReturnType<typeof setInterval>
onMounted(() => {
  timer = setInterval(() => { if (props.banner.length > 1) next() }, 6000)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <section
    v-if="props.skeleton || slide"
    :class="['relative overflow-hidden transition-colors duration-500', slide?.dark ? 'bg-primary-500' : 'bg-surface-cream']"
  >
    <!-- Círculo decorativo de fondo -->
    <div :class="[
      'absolute -right-48 top-1/2 -translate-y-1/2 w-200 h-200 rounded-full opacity-60 pointer-events-none',
      slide?.dark ? 'bg-white/8' : 'bg-accent-soft',
    ]" />

    <!-- Contenido -->
    <div class="relative px-6 md:px-16 pt-18 grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-12 md:gap-16 items-center min-h-125 md:min-h-135">
      <!-- Texto -->
      <div v-if="props.skeleton" class="animate-pulse">
        <div class="h-6 w-40 bg-secondary-900/10 rounded-full mb-7" />
        <div class="h-16 w-full bg-secondary-900/10 rounded-lg mb-4" />
        <div class="h-16 w-3/4 bg-secondary-900/10 rounded-lg mb-9" />
        <div class="h-12 w-48 bg-secondary-900/10 rounded-full" />
      </div>
      <div v-else-if="slide">
        <div v-if="slide.tag || slide.kicker" class="flex items-center gap-3 mb-7">
          <LandingBadge v-if="slide.tag" :variant="slide.dark ? 'paper' : 'ink'" size="md">
            <span class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-dot" />
            {{ slide.tag }}
          </LandingBadge>
          <span
            v-if="slide.kicker"
            :class="['font-mono text-[0.6875rem] font-semibold tracking-widest uppercase', slide.dark ? 'text-white/80' : 'text-secondary-500']"
          >
            {{ slide.kicker }}
          </span>
        </div>

        <h1 class="font-display font-bold leading-[0.95] tracking-tight text-[clamp(56px,6vw,88px)] text-balance">
          <span
            v-for="(part, i) in titleParts"
            :key="i"
            class="block py-0.5"
            :class="part.accent
              ? (slide.dark ? 'text-accent-tint' : 'text-primary-500 italic')
              : (slide.dark ? 'text-white' : 'text-secondary-900')"
          >{{ part.text }}</span>
        </h1>

        <p
          v-if="slide.sub"
          :class="['font-body text-[1.0625rem] leading-relaxed mt-6 mb-9 max-w-xl text-pretty', slide.dark ? 'text-white/85' : 'text-secondary-500']"
        >
          {{ slide.sub }}
        </p>

        <div v-if="slide.cta || slide.cta2" class="flex flex-wrap gap-3">
          <RouterLink v-if="slide.cta" to="/programs">
            <LandingButton :variant="slide.dark ? 'on-accent' : 'primary'" size="lg">{{ slide.cta }}</LandingButton>
          </RouterLink>
          <RouterLink v-if="slide.cta2" to="/contact">
            <LandingButton :variant="slide.dark ? 'on-accent-sec' : 'secondary'" size="lg" :arrow="false">{{ slide.cta2 }}</LandingButton>
          </RouterLink>
        </div>
      </div>

      <!-- Lado visual — imagen del banner + chips flotantes -->
      <div class="hidden md:flex relative justify-center items-center min-h-105">
        <!-- Rectángulos decorativos, no círculos: acompañan la forma del contenido real (foto o ilustración), que dejó de ser circular. -->
        <div :class="['absolute w-full max-w-105 aspect-square border', slide?.dark ? 'bg-white/12 border-dashed border-white/30' : 'bg-surface-paper border-line']" />
        <div :class="['absolute w-4/5 max-w-80 aspect-square border border-dashed', slide?.dark ? 'border-white/20' : 'border-line-soft']" />

        <!--
          Con foto: rectángulo, no círculo. Las imágenes reales de banner son
          apaisadas y de proporciones distintas (1920×1080 y 1366×501): el marco
          NO fija proporción y la imagen manda su alto, así ninguna se recorta
          (con `object-cover` en un marco fijo se perdían los laterales de las
          panorámicas, textos incluidos). El diseño unificó TODO el lado
          visual a rectángulo (fondo decorativo incluido, arriba), tanto con
          foto real como con la ilustración de respaldo.
        -->
        <div
          v-if="!props.skeleton && slide && hasPhoto"
          class="relative z-10 w-11/12 max-w-105 overflow-hidden shadow-md bg-black"
        >
          <img :src="slide.desktop" :alt="slide.image_alt" class="block w-full h-auto" />
        </div>
        <div
          v-else-if="!props.skeleton && slide"
          class="relative z-10 -translate-y-3 w-80 h-80 overflow-visible bg-transparent flex items-center justify-center"
        >
          <IsoTower :size="340" :accent="slide.dark ? '#FFFFFF' : 'var(--color-primary-500)'" bg="transparent" />
        </div>

        <!-- Chip superior -->
        <div v-if="!props.skeleton && slide" :class="[
          'absolute top-10 right-6 px-3.5 py-2.5 rounded-xl shadow-md font-mono text-[0.6875rem] font-semibold flex items-center gap-2',
          slide.dark ? 'bg-black/40 text-white' : 'bg-surface-paper text-secondary-900',
        ]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e94e1b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3 L13 10 L20 11 L13 12 L12 19 L11 12 L4 11 L11 10 Z" fill="#e94e1b"/>
          </svg>
          Certificación Autodesk
        </div>

        <!-- Chip inferior -->
        <div v-if="!props.skeleton && slide" :class="[
          'absolute bottom-10 left-2 px-3.5 py-2.5 rounded-xl shadow-md font-body text-[0.781rem] font-semibold flex items-center gap-2',
          slide.dark ? 'bg-black/40 text-white' : 'bg-surface-paper text-secondary-900',
        ]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e94e1b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/><path d="M12 7V12L15.5 14"/>
          </svg>
          Clases en vivo
        </div>
      </div>
    </div>

    <!-- Barra inferior: meta + controles -->
    <div v-if="!props.skeleton && slide" :class="['relative border-t px-6 md:px-16 py-5 flex flex-wrap justify-between items-center gap-4', slide.dark ? 'border-white/20' : 'border-line']">
      <!-- Meta datos -->
      <div v-if="metaEntries.length" class="flex flex-wrap gap-8">
        <div v-for="([label, value]) in metaEntries" :key="label">
          <p :class="['font-mono text-[0.594rem] tracking-widest uppercase', slide.dark ? 'text-white/60' : 'text-secondary-400']">{{ label }}</p>
          <p :class="['font-display text-[1.125rem] font-bold tracking-tight mt-1', slide.dark ? 'text-white' : 'text-secondary-900']">{{ value }}</p>
        </div>
      </div>
      <div v-else />

      <!-- Controles -->
      <div v-if="props.banner.length > 1" class="flex items-center gap-4">
        <!-- Dots -->
        <div class="flex gap-1.5">
          <button v-for="(_, i) in props.banner" :key="i" @click="idx = i"
            :class="[
              'h-2 rounded-full transition-all duration-300',
              i === idx ? 'w-8' : 'w-2',
              slide.dark ? (i === idx ? 'bg-white' : 'bg-white/40') : (i === idx ? 'bg-secondary-900' : 'bg-secondary-900/30'),
            ]" />
        </div>
        <!-- Flechas -->
        <div class="flex gap-1.5">
          <button @click="prev" :class="[
            'w-10 h-10 rounded-full border-[0.094rem] inline-flex items-center justify-center transition-colors',
            slide.dark
              ? 'border-white text-white hover:bg-white hover:text-primary-500 active:bg-white/90'
              : 'border-secondary-900 text-secondary-900 hover:bg-secondary-900 hover:text-white active:bg-black',
          ]">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13 8H3 M7 4L3 8L7 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button @click="next" :class="[
            'w-10 h-10 rounded-full border-[0.094rem] inline-flex items-center justify-center transition-colors',
            slide.dark
              ? 'border-white text-white hover:bg-white hover:text-primary-500 active:bg-white/90'
              : 'border-secondary-900 text-secondary-900 hover:bg-secondary-900 hover:text-white active:bg-black',
          ]">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8H13 M9 4L13 8L9 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
