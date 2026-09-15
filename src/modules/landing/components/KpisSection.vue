<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useIntersectionObserver } from '../composables/useIntersectionObserver'
import { useCountUp } from '../composables/useCountUp'
import type { Kpi } from '@/modules/landing/models/general.model'

const props = defineProps<{ kpis: Kpi[]; skeleton: boolean }>()

const sectionRef = ref<HTMLElement | null>(null)
const { isIntersecting } = useIntersectionObserver(() => sectionRef.value, { threshold: 0.3 })

const ICONS = [
  /* graduate */
  `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  /* briefcase */
  `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`,
  /* globe */
  `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  /* badge */
  `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
]

const displayKpis = computed(() =>
  props.kpis.filter((k: Kpi) => typeof k.value === 'number' && !isNaN(k.value) && k.value > 0)
)

const animatedKpis = computed(() =>
  displayKpis.value.map((kpi: Kpi, i: number) => {
    const { currentValue, start, hasAnimated } = useCountUp(kpi.value, '{n}')
    const DEFAULT_ICON = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>`
    return { ...kpi, currentValue, start, hasAnimated, svgIcon: ICONS[i] ?? DEFAULT_ICON }
  })
)

function triggerAll() {
  animatedKpis.value.forEach(k => { if (!k.hasAnimated.value) k.start() })
}

watch([displayKpis, isIntersecting], ([kpis, visible]) => {
  if (kpis.length > 0 && visible) triggerAll()
}, { deep: true })

onMounted(() => {
  const el = sectionRef.value
  if (!el) return
  const { top, bottom } = el.getBoundingClientRect()
  if (top < window.innerHeight && bottom > 0) triggerAll()
})

const ACCENT_INDEX = 1
</script>

<template>
  <section ref="sectionRef" class="bg-surface-page py-24">
    <div class="px-6 md:px-16">
      <!-- Header: 2-col on md+ -->
      <div class="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-16 items-center mb-14">
        <div>
          <p class="font-mono text-[0.6875rem] tracking-widest uppercase text-secondary-400 mb-3">IMPACTO · MÉTRICAS {{ new Date().getFullYear() }}</p>
          <h2 class="font-display font-bold text-[clamp(40px,5vw,64px)] leading-[0.98] tracking-tight text-secondary-900 text-balance">
            Los <span class="text-primary-500 italic">números</span><br>no mienten.
          </h2>
        </div>
        <p class="font-body text-[1.0625rem] text-secondary-500 leading-relaxed max-w-lg text-pretty">
          Nuestro impacto se refleja en la experiencia, innovación y empleabilidad de nuestros egresados — en Perú.
        </p>
      </div>

      <!-- KPI grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Skeleton -->
        <template v-if="skeleton">
          <div v-for="i in 4" :key="i"
            :class="['rounded-lg p-8 animate-pulse min-h-48', i === ACCENT_INDEX + 1 ? 'bg-primary-500/20' : 'bg-line-soft']" />
        </template>

        <!-- Real data -->
        <template v-else>
          <div
            v-for="(kpi, i) in animatedKpis"
            :key="kpi.id"
            :class="[
              'rounded-lg p-8 flex flex-col relative overflow-hidden border',
              i === ACCENT_INDEX
                ? 'bg-primary-500 border-primary-500 shadow-accent'
                : 'bg-surface-paper border-line shadow-sm hover:-translate-y-1 transition-transform duration-300',
            ]"
          >
            <!-- Icon -->
            <div
              :class="[
                'w-13 h-13 rounded-xl flex items-center justify-center mb-6',
                i === ACCENT_INDEX ? 'bg-white/18' : 'bg-accent-soft',
              ]"
              :style="{ color: i === ACCENT_INDEX ? 'white' : '#e94e1b' }"
              v-html="kpi.svgIcon"
            />

            <!-- Value + suffix — large counter -->
            <div class="flex items-baseline gap-0.5 font-display font-bold leading-none tracking-tight mb-5">
              <span :class="['text-[4.5rem]', i === ACCENT_INDEX ? 'text-white' : 'text-secondary-900']">
                {{ kpi.currentValue }}
              </span>
              <span v-if="kpi.suffix" :class="['text-[2rem]', i === ACCENT_INDEX ? 'text-white/70' : 'text-primary-500']">
                {{ kpi.suffix }}
              </span>
            </div>

            <!-- Label -->
            <p :class="[
              'font-body text-[0.906rem] leading-snug',
              i === ACCENT_INDEX ? 'text-white/85' : 'text-secondary-500',
            ]">
              {{ kpi.label }}
            </p>

            <!-- Corner decoration circle -->
            <div
              :class="[
                'absolute -right-5 -top-5 w-22 h-22 rounded-full opacity-60',
                i === ACCENT_INDEX ? 'bg-white/6' : 'bg-accent-soft',
              ]"
            />
          </div>
        </template>
      </div>
    </div>
  </section>
</template>
