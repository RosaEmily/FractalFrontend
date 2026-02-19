<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <section class="bg-white">
    <div class="relative isolate mx-auto max-w-6xl px-16 sm:px-6 md:px-8 lg:px-10">
      <div class="mx-auto max-w-2xl lg:max-w-none py-12 sm:py-16 lg:py-24 text-center">
        <div class="text-center">
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance text-secondary-800">
              Nuestros alumnos opinan
            </h1>
            <p class="mt-4 text-lg text-secondary-400">
              Únete a miles de estudiantes exitosos que transformaron sus carreras con nosotros
            </p>
            <div class="flex flex-wrap justify-center gap-10 mt-16 text-left">
                <div v-for="item in reviews" :key="item.name" class="w-full md:w-76 lg:w-80 flex flex-col items-start border border-secondary-200 p-5 rounded-lg bg-white">
                    
                    <div class="flex items-center gap-3 mt-4">
                        <img class="h-12 rounded-full" :src="item.image" :alt="item.name">
                        <div>
                            <h2 class="text-lg text-secondary-900 font-medium">{{item.name}}</h2>
                            <p class="text-sm text-secondary-500">{{item.career}} @ {{item.work}}</p>
                        </div>
                    </div>
                    <div class="flex items-center justify-center mt-3 gap-1">
                      <template v-for="n in 5" :key="item.name + n">
                        <!-- Estrella completa -->
                        <StarIcon v-if="n <= Math.floor(item.stars)" class="size-5 text-yellow-500" aria-hidden="true" />
                        <!-- Media estrella -->
                        <div v-else-if="n - item.stars === 0.5" class="relative size-5">
                          <StarOutlineIcon class="absolute inset-0 text-yellow-500" />
                          <div class="absolute inset-0 overflow-hidden" style="clip-path: inset(0 50% 0 0);">
                            <StarIcon class="text-yellow-500" />
                          </div>
                        </div>
                        <!-- Estrella vacía -->
                        <StarOutlineIcon v-else class="size-5 text-yellow-500" aria-hidden="true" />
                      </template>
                    </div>
                    <p class="text-sm mt-3 text-secondary-600">{{ item.opinion }}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { StarIcon } from '@heroicons/vue/24/solid'
  import { StarIcon as StarOutlineIcon } from '@heroicons/vue/24/outline'

  type Review = {
    name: string
    career: string
    work: string
    image: string
    opinion: string
    stars: number
  }

  defineProps<{ reviews: Review[]}>()
</script>
