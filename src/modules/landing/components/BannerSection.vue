<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import LandingBadge from './ui/LandingBadge.vue'
import LandingButton from './ui/LandingButton.vue'

const SLIDES = [
  {
    tag: 'NUEVA COHORTE · JUL 2025',
    kicker: '15 cupos disponibles',
    titleParts: [
      { text: 'Conviértete en el',  accent: false },
      { text: 'modelador BIM',      accent: true  },
      { text: 'que la industria busca.', accent: false },
    ],
    sub: 'Diplomado internacional de 6 meses con certificación Autodesk. Aprende Revit, Navisworks, Dynamo y gestión de proyectos en un solo programa.',
    cta: 'Inscribirme ahora',
    cta2: 'Ver malla curricular',
    meta: [['Inicia', '15 JUL'], ['Duración', '6 meses'], ['Modalidad', 'En vivo'], ['Inversión', 'S/ 2,400']],
    dark: false,
  },
  {
    tag: 'CAMPAÑA · BECA AEC 2025',
    kicker: '40 cupos · vence 30 JUN',
    titleParts: [
      { text: '25% de descuento',        accent: false },
      { text: 'para profesionales',       accent: true  },
      { text: 'del rubro AEC.',           accent: false },
    ],
    sub: 'Aplica a la beca Fractal × Autodesk en 2 minutos. Disponible para arquitectos, ingenieros y bachilleres con experiencia comprobable.',
    cta: 'Aplicar a la beca',
    cta2: 'Ver requisitos',
    meta: [['Descuento', '25%'], ['Vence', '30 JUN'], ['Cupos', '40'], ['Aplica', 'BIM · CAD']],
    dark: true,
  },
  {
    tag: 'NUEVO · CIVIL 3D',
    kicker: 'Inicia 20 AGO',
    titleParts: [
      { text: 'Especialización en', accent: false },
      { text: 'infraestructura',    accent: true  },
      { text: 'civil y vial.',      accent: false },
    ],
    sub: 'Diseña corredores y obras viales con Civil 3D. Caso real incluido: tramo Lima — Cañete, con datos reales del MTC.',
    cta: 'Ver programa',
    cta2: 'Hablar con asesor',
    meta: [['Inicia', '20 AGO'], ['Duración', '4 meses'], ['Nivel', 'Intermedio'], ['Cert.', 'Autodesk']],
    dark: false,
  },
]

const idx = ref(0)
const slide = computed(() => SLIDES[idx.value])

const prev = () => { idx.value = (idx.value - 1 + SLIDES.length) % SLIDES.length }
const next = () => { idx.value = (idx.value + 1) % SLIDES.length }

let timer: ReturnType<typeof setInterval>
onMounted(() => { timer = setInterval(next, 6000) })
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <section :class="['relative overflow-hidden transition-colors duration-500', slide.dark ? 'bg-primary-500' : 'bg-surface-cream']">
    <!-- Círculo decorativo de fondo -->
    <div :class="[
      'absolute -right-48 top-1/2 -translate-y-1/2 w-200 h-200 rounded-full opacity-60 pointer-events-none',
      slide.dark ? 'bg-white/8' : 'bg-accent-soft',
    ]" />

    <!-- Contenido -->
    <div class="relative px-6 md:px-16 pt-18 pb-16 md:pb-20 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center min-h-125 md:min-h-140">
      <!-- Texto -->
      <div>
        <div class="flex items-center gap-3 mb-7">
          <LandingBadge :variant="slide.dark ? 'paper' : 'ink'" size="md">
            <span class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-dot" />
            {{ slide.tag }}
          </LandingBadge>
          <span :class="['font-mono text-[0.6875rem] font-semibold tracking-widest uppercase', slide.dark ? 'text-white/80' : 'text-secondary-500']">
            {{ slide.kicker }}
          </span>
        </div>

        <h1 class="font-display font-bold leading-[0.95] tracking-tight text-[clamp(56px,6vw,88px)] text-balance">
          <span
            v-for="(part, i) in slide.titleParts"
            :key="i"
            class="block py-0.5"
            :class="part.accent
              ? (slide.dark ? 'text-accent-tint' : 'text-primary-500 italic')
              : (slide.dark ? 'text-white' : 'text-secondary-900')"
          >{{ part.text }}</span>
        </h1>

        <p :class="['font-body text-[1.0625rem] leading-relaxed mt-6 mb-9 max-w-xl text-pretty', slide.dark ? 'text-white/85' : 'text-secondary-500']">
          {{ slide.sub }}
        </p>

        <div class="flex flex-wrap gap-3">
          <RouterLink to="/programs">
            <LandingButton :variant="slide.dark ? 'on-accent' : 'primary'" size="lg">{{ slide.cta }}</LandingButton>
          </RouterLink>
          <RouterLink to="/contact">
            <LandingButton :variant="slide.dark ? 'on-accent-sec' : 'secondary'" size="lg" :arrow="false">{{ slide.cta2 }}</LandingButton>
          </RouterLink>
        </div>
      </div>

      <!-- Lado visual — chips flotantes + placeholder geométrico -->
      <div class="hidden md:flex relative justify-center items-center min-h-105">
        <div :class="['absolute w-80 h-80 rounded-full border', slide.dark ? 'bg-white/12 border-dashed border-white/30' : 'bg-surface-paper border-line']" />
        <div :class="['absolute w-60 h-60 rounded-full border border-dashed', slide.dark ? 'border-white/20' : 'border-line-soft']" />

        <!-- Logo grande centrado como placeholder ilustración -->
        <div class="relative z-10 -translate-y-3">
          <svg width="180" height="200" viewBox="0 0 40 44" fill="none">
            <path d="M20 1.5 L37.5 11.5 L37.5 32.5 L20 42.5 L2.5 32.5 L2.5 11.5 Z"
              :fill="slide.dark ? 'rgba(255,255,255,0.15)' : '#FFF1E8'"
              :stroke="slide.dark ? 'rgba(255,255,255,0.4)' : '#EBE2D0'" stroke-width="1.2" stroke-linejoin="round"/>
            <path d="M14 13 L26 13 L26 17 L18 17 L18 22 L24.5 22 L24.5 26 L18 26 L18 32 L14 32 Z"
              :fill="slide.dark ? 'rgba(255,255,255,0.6)' : '#E94E1B'"/>
          </svg>
        </div>

        <!-- Chip superior -->
        <div :class="[
          'absolute top-10 right-6 px-3.5 py-2.5 rounded-xl shadow-md font-mono text-[0.6875rem] font-semibold flex items-center gap-2',
          slide.dark ? 'bg-black/40 text-white' : 'bg-surface-paper text-secondary-900',
        ]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e94e1b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3 L13 10 L20 11 L13 12 L12 19 L11 12 L4 11 L11 10 Z" fill="#e94e1b"/>
          </svg>
          Certificación Autodesk
        </div>

        <!-- Chip inferior -->
        <div :class="[
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
    <div :class="['relative border-t px-6 md:px-16 py-5 flex flex-wrap justify-between items-center gap-4', slide.dark ? 'border-white/20' : 'border-line']">
      <!-- Meta datos -->
      <div class="flex flex-wrap gap-8">
        <div v-for="([label, value]) in slide.meta" :key="label">
          <p :class="['font-mono text-[0.594rem] tracking-widest uppercase', slide.dark ? 'text-white/60' : 'text-secondary-400']">{{ label }}</p>
          <p :class="['font-display text-[1.125rem] font-bold tracking-tight mt-1', slide.dark ? 'text-white' : 'text-secondary-900']">{{ value }}</p>
        </div>
      </div>

      <!-- Controles -->
      <div class="flex items-center gap-4">
        <!-- Dots -->
        <div class="flex gap-1.5">
          <button v-for="(_, i) in SLIDES" :key="i" @click="idx = i"
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
