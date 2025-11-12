<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <section ref="sectionRef" class="bg-primary-500">
    <div class="mx-auto max-w-7xl px-6 text-center py-28">
      <h1 class="text-4xl sm:text-6xl font-semibold tracking-tight text-white">
        Los <span class="font-bold uppercase">números</span> no mienten
      </h1>
      <p class="mt-4 text-lg text-secondary-100">
        Nuestro impacto se refleja en la experiencia, la innovación y la empleabilidad de nuestros egresados.
      </p>
      <div class="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="item in animatedKpis" :key="item.description" class="flex flex-col items-center">
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <component :is="item.icon" class="h-12 w-12" aria-hidden="true" />
          </div>
          <p class="mt-4 text-4xl font-extrabold text-white">
            {{ item.currentValue }}
          </p>
          <p class="mt-2 text-lg text-primary-100">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import type { FunctionalComponent } from 'vue'
  import { useIntersectionObserver } from '@/composables/useIntersectionObserver'
  import { useCountUp } from '@/composables/useCountUp'

  type Kpi = {
    icon: FunctionalComponent
    number: number
    description: string
    format: string
  }

  const props = defineProps<{ kpis: Kpi[] }>()

  const sectionRef = ref<HTMLElement | null>(null)
  const { isIntersecting } = useIntersectionObserver(() => sectionRef.value, { threshold: 0.3 })

  const animatedKpis = props.kpis.map(kpi => {
    const { currentValue, start, hasAnimated } = useCountUp(kpi.number, kpi.format)
    return { ...kpi, currentValue, start, hasAnimated }
  })

  watch(isIntersecting, visible => {
    if (visible) {
      animatedKpis.forEach(c => {
        if (!c.hasAnimated.value) c.start()
      })
    }
  })
</script>
