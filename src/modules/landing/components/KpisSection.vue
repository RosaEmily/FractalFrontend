<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useIntersectionObserver } from '../composables/useIntersectionObserver'
import { useCountUp } from '../composables/useCountUp'
import type { Kpi } from '@/modules/landing/models/general.model'
import KpiCard from './blocks/KpiCard.vue'
import { kpiIcon } from './blocks/kpi-icons'

const props = defineProps<{ kpis: Kpi[]; skeleton: boolean }>()

const sectionRef = ref<HTMLElement | null>(null)
const { isIntersecting } = useIntersectionObserver(() => sectionRef.value, { threshold: 0.3 })


const displayKpis = computed(() =>
  props.kpis.filter((k: Kpi) => typeof k.value === 'number' && !isNaN(k.value) && k.value > 0)
)

const animatedKpis = computed(() =>
  displayKpis.value.map((kpi: Kpi, i: number) => {
    const { currentValue, start, hasAnimated } = useCountUp(kpi.value, '{n}')
    return { ...kpi, currentValue, start, hasAnimated, svgIcon: kpiIcon(i) }
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
          <KpiCard
            v-for="(kpi, i) in animatedKpis"
            :key="kpi.id"
            :value="kpi.currentValue"
            :prefix="kpi.prefix"
            :suffix="kpi.suffix"
            :label="kpi.label"
            :svg-icon="kpi.svgIcon"
            :accent="i === ACCENT_INDEX"
          />
        </template>
      </div>
    </div>
  </section>
</template>
