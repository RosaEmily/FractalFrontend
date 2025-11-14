<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <section ref="sectionRef" class="bg-primary-500 py-28">
    <div class="mx-auto max-w-7xl px-6 md:px-16 lg:px-24 xl:px-32 text-center">
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
        Los <span class="font-bold uppercase">números</span> no mienten
      </h1>
      <p class="mt-4 text-lg text-secondary-100">
        Nuestro impacto se refleja en la experiencia, la innovación y la empleabilidad de nuestros egresados.
      </p>

      <div class="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Skeletons mientras cargan los datos -->
        <template v-if="loading">
        <div v-for="i in 4" :key="i" class="flex flex-col items-center">
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 animate-pulse"></div>
          <p class="mt-4 h-10 w-20 bg-white animate-pulse rounded"></p>
          <p class="mt-2 h-4 w-32 bg-primary-100 animate-pulse rounded"></p>
        </div>
        </template>
        <!-- Componente real -->
        <div v-else v-for="item in animatedKpis" :key="item.id" class="flex flex-col items-center">
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
  import { ref, watch, computed, onMounted } from 'vue'
  import type { FunctionalComponent } from 'vue'
  import { useIntersectionObserver } from '@/composables/useIntersectionObserver'
  import { useCountUp } from '@/composables/useCountUp'

  type Kpi = {
    id: number
    icon: FunctionalComponent
    number: number
    description: string
    format: string
  }

  const props = defineProps<{ kpis: Kpi[], loading: boolean }>()

  const sectionRef = ref<HTMLElement | null>(null)
  const { isIntersecting } = useIntersectionObserver(() => sectionRef.value, { threshold: 0.3 })

  const animatedKpis = computed(() => {
    if (!props.kpis.length) return []
    return props.kpis.map(kpi => {
      const { currentValue, start, hasAnimated } = useCountUp(kpi.number, kpi.format)
      return { ...kpi, currentValue, start, hasAnimated }
    })
  })

  watch(isIntersecting, visible => {
    if (visible) {
      animatedKpis.value.forEach(c => {
        if (!c.hasAnimated.value) c.start()
      })
    }
  })

  onMounted(() => {
    const el = sectionRef.value
    if (!el) return

    const rect = el.getBoundingClientRect()
    const isAlreadyVisible =
      rect.top < window.innerHeight &&
      rect.bottom > 0

    if (isAlreadyVisible) {
      animatedKpis.value.forEach(c => {
        if (!c.hasAnimated.value) c.start()
      })
    }
  })
</script>