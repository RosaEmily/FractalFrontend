<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import LandingBadge from '../ui/LandingBadge.vue'
import LandingImage from '../ui/LandingImage.vue'
import LandingButton from '../ui/LandingButton.vue'
import type { Offer } from '@/modules/landing/models/offer.model'
import { offerTypeLabel } from '@/modules/landing/constants/labels'

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
    class="group grid grid-cols-[8.75rem_1fr_auto] sm:grid-cols-[10rem_1fr_auto] gap-4 sm:gap-6 items-center bg-surface-paper border border-line rounded-2xl p-3.5 sm:p-4.5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
  >
    <!-- Image -->
    <div class="relative overflow-hidden rounded-lg aspect-video bg-line-soft">
      <LandingImage
        :src="program.image_url"
        :alt="program.name"
        :fallback-src="placeholder"
        img-class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>

    <!-- Content -->
    <div class="min-w-0">
      <div class="flex items-center gap-2 flex-wrap mb-1.5">
        <LandingBadge variant="tint" size="sm">{{ offerTypeLabel(program.type) }}</LandingBadge>
        <LandingBadge :variant="STATUS_VARIANT[program.status] ?? 'soft'" size="sm">
          {{ program.status_label }}
        </LandingBadge>
      </div>

      <h3 class="font-display font-bold text-[1.0625rem] leading-snug tracking-tight text-secondary-900 truncate">
        {{ program.prefix }} {{ program.name }}
      </h3>

      <p class="font-body text-[0.8125rem] text-secondary-400 mt-1">
        {{ program.duration_label ?? '—' }} · {{ program.courses.length }} curso{{ program.courses.length !== 1 ? 's' : '' }}
      </p>

      <div v-if="tags.length" class="flex flex-wrap gap-1.5 mt-2.5">
        <span
          v-for="tag in tags.slice(0, 4)"
          :key="tag"
          class="font-mono text-[0.625rem] text-secondary-500 px-2 py-0.5 border border-line rounded"
        >{{ tag }}</span>
      </div>
    </div>

    <!-- Price + CTA -->
    <div class="text-right shrink-0">
      <div class="font-display font-extrabold text-[1.375rem] tracking-tight text-secondary-900">{{ program.price }}</div>
      <LandingButton variant="soft" size="sm" :arrow="false" class="mt-2.5">Ver detalle</LandingButton>
    </div>
  </RouterLink>
</template>
