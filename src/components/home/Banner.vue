<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <section class="bg-white py-4 md:p-6">
    <div class="relative w-full overflow-hidden rounded-lg">
      <div class="flex transition-transform duration-700" :style="{ transform: `translateX(-${current * 100}%)` }">
        <div v-for="(img, i) in images" :key="i" class="min-w-full px-6">
          <picture>
            <!-- imagen para pantallas grandes -->
            <source media="(min-width: 768px)" :srcset="img.desktop" />
            <!-- imagen para móviles -->
            <img :src="img.mobile"  class="w-full h-fit xl:h-120 object-cover block" :alt="`slide ${i + 1}`"/>
          </picture>
        </div>
      </div>
      <button @click="prev" class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 p-2 text-white w-10 rounded-full cursor-pointer">
        <ChevronLeftIcon class="size-6" aria-hidden="true" />
      </button>
      <button @click="next" class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 p-2 text-white w-10 rounded-full cursor-pointer">
        <ChevronRightIcon class="size-6" aria-hidden="true" />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'

  const props = defineProps<{ images: Array<{ desktop: string; mobile: string }> }>()

  const current = ref(0)

  const next = () => { current.value = (current.value + 1) % props.images.length }
  const prev = () => { current.value = (current.value - 1 + props.images.length) % props.images.length }

  let interval: number | null = null

  onMounted(() => {
    interval = setInterval(next, 5000)
  })

  onUnmounted(() => {
    if (interval) clearInterval(interval)
  })
</script>