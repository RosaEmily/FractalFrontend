<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <section class="bg-white">
    <div class="mx-auto max-w-7xl px-6 md:px-8 lg:px-10">
      <div class="mx-auto max-w-2xl lg:max-w-none py-12 sm:py-16 lg:py-24 text-center">
        <div class="text-center pb-4 sm:pb-8 lg:pb-12">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance text-secondary-800 pb-6">
            Últimos lanzamientos
          </h1>
          <button class="inline-flex items-center text-lg md:text-xl text-primary-600 hover:text-primary-800 dark:text-primary-500 dark:hover:text-primary-700 cursor-pointer">
            Descubre más <ChevronRightIcon class="pt-1 size-5 md:size-6" aria-hidden="true" />
          </button>
        </div>
        <div class="mt-6 space-y-12 sm:grid sm:grid-cols-2 sm:space-y-6 sm:gap-x-6 md:gap-x-8 lg:grid lg:grid-cols-4 lg:space-y-0 lg:gap-x-8">
          <div v-for="callout in callouts.slice(0, visibleCount)" :key="callout.name" class="group relative px-10 sm:px-0 transition-transform duration-300 hover:-translate-y-2 cursor-pointer">
            <div class="rounded-lg overflow-hidden shadow-sm hover:shadow-lg bg-white">
              <img :src="callout.imageSrc" :alt="callout.imageAlt" class="w-full object-cover group-hover:opacity-75 max-sm:h-40 aspect-2/1 lg:aspect-square" />
            </div>
            <h3 class="mt-6 text-sm md:text-base text-gray-500">{{ callout.description }}</h3>
            <p class="text-base md:text-lg font-semibold text-gray-900 pt-1 uppercase">{{ callout.name }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'  
  import { ChevronRightIcon } from '@heroicons/vue/24/solid'

  type Callout = {
    name: string
    description: string
    tags?: string[]
    imageSrc: string
    imageAlt: string
    href?: string
  }

  defineProps<{ callouts: Callout[]}>()

  const screenWidth = ref(window.innerWidth)

  onMounted(() => {
    window.addEventListener('resize', () => {
      screenWidth.value = window.innerWidth
    })
  })

  const visibleCount = computed(() => {
    if (screenWidth.value >= 1024) return 4 // lg
    return 2 // md
  })
</script>