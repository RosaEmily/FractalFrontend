<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import LandingBadge from '../ui/LandingBadge.vue'
import LandingImage from '../ui/LandingImage.vue'
import type { Offer } from '@/modules/landing/models/offer.model'

const props = defineProps<{ program: Offer }>()

const placeholder = new URL('@/assets/course/placeholder.jpg', import.meta.url).href

const tags = computed(() => props.program.courses[0]?.tags ?? [])

const STATUS_VARIANT: Record<string, 'open' | 'upcoming' | 'soft' | 'ink'> = {
  open:    'open',
  upcoming:'upcoming',
  ongoing: 'soft',
  ended:   'ink',
}
</script>

<template>
  <RouterLink
    :to="`/programs/${program.id}`"
    class="group flex flex-col bg-surface-paper border border-line rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-300"
  >
    <!-- Image -->
    <div class="relative overflow-hidden aspect-video bg-line-soft">
      <LandingImage
        :src="program.image_url"
        :alt="program.name"
        :fallback-src="placeholder"
        img-class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div class="absolute top-3 left-3">
        <LandingBadge :variant="STATUS_VARIANT[program.status] ?? 'soft'" size="sm">
          {{ program.status_label }}
        </LandingBadge>
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-col flex-1 p-5 gap-2">
      <div class="flex items-center gap-2 flex-wrap">
        <LandingBadge variant="tint" size="sm">{{ program.type }}</LandingBadge>
        <span v-if="tags.length > 0" class="font-mono text-[0.625rem] text-secondary-400 uppercase tracking-wide">
          {{ tags.slice(0, 2).join(' · ') }}
        </span>
      </div>

      <h3 class="font-display font-bold text-[1rem] leading-snug tracking-tight text-secondary-900 line-clamp-2 mt-1">
        {{ program.prefix }} {{ program.name }}
      </h3>

      <p class="font-body text-[0.8125rem] text-secondary-400">{{ program.courses[0]?.teacher }}</p>

      <div class="mt-auto pt-3 flex items-center justify-between border-t border-line-soft">
        <span class="font-mono text-[0.6875rem] text-secondary-400">
          {{ program.duration_months }}m · {{ program.courses.length }} cursos
        </span>
        <span class="font-display font-bold text-[1rem] text-primary-500">{{ program.price }}</span>
      </div>
    </div>
  </RouterLink>
</template>
