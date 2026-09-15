<script setup lang="ts">
import LandingSectionHeader from './ui/LandingSectionHeader.vue'
import LandingStars from './ui/LandingStars.vue'
import LandingBadge from './ui/LandingBadge.vue'

type Review = {
  name: string
  career: string
  work: string
  image: string
  opinion: string
  stars: number
  program?: string
}

defineProps<{ reviews: Review[] }>()

const AVATAR_COLORS = [
  { bg: '#FFE3D3', text: '#B83A10' },
  { bg: '#FFF3CD', text: '#A56E00' },
  { bg: '#D4EDDA', text: '#1B6B3A' },
]

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('')
}
</script>

<template>
  <section class="bg-surface-page py-24">
    <div class="px-6 md:px-16">
      <LandingSectionHeader
        :index="7"
        eyebrow="VOCES DE LA COMUNIDAD"
        subtitle="Egresados que ya están coordinando obras, modelando proyectos reales y postulando a vacantes mejor pagadas."
      >
        <template #title>
          Lo que <span class="text-primary-500 italic">opinan</span><br>nuestros alumnos.
        </template>
      </LandingSectionHeader>

      <div class="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
        <figure
          v-for="(review, i) in reviews"
          :key="review.name"
          class="relative bg-surface-paper border border-line rounded-2xl p-8 shadow-sm flex flex-col overflow-hidden hover:-translate-y-1 transition-transform duration-300"
        >
          <!-- Big quote mark background -->
          <span class="absolute -top-4 -right-2 font-display font-extrabold text-[10rem] leading-[0.7] text-accent-soft pointer-events-none select-none">"</span>

          <!-- Stars + program badge -->
          <div class="relative flex items-center justify-between mb-6">
            <LandingStars :value="review.stars" :size="15" />
            <LandingBadge v-if="review.program" variant="soft" size="sm">{{ review.program }}</LandingBadge>
          </div>

          <!-- Quote -->
          <blockquote class="relative font-display font-medium text-[1.125rem] leading-[1.35] tracking-tight text-secondary-900 flex-1 text-pretty">
            "{{ review.opinion }}"
          </blockquote>

          <!-- Author -->
          <div class="flex items-center gap-3.5 pt-5 mt-5 border-t border-line">
            <!-- Avatar: initials in tinted circle -->
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-[1rem] shrink-0"
              :style="{ background: AVATAR_COLORS[i % 3].bg, color: AVATAR_COLORS[i % 3].text }"
            >
              {{ initials(review.name) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-display font-bold text-[0.9375rem] text-secondary-900 tracking-tight">{{ review.name }}</p>
              <p class="font-body text-[0.781rem] text-secondary-500 mt-0.5">{{ review.career }} · {{ review.work }}</p>
            </div>
          </div>
        </figure>
      </div>
    </div>
  </section>
</template>
