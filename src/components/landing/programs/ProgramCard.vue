<template>
  <div class="group relative flex flex-col rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 bg-white cursor-pointer">
    <div class="overflow-hidden rounded-t-lg aspect-video bg-gray-100">
      <img
        :src="program.image_url"
        :alt="program.name"
        @error="(e) => (e.target as HTMLImageElement).src = placeholder"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>
    <div class="flex flex-col flex-1 p-4 gap-2">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xs font-semibold uppercase tracking-wider text-primary-500 bg-primary-50 px-2 py-0.5 rounded">
          {{ program.type }}
        </span>
        <span v-if="tags.length > 0" class="tooltip-trigger relative text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded cursor-default">
          {{ tags.length }} TAGS
          <span class="tooltip">{{ tags.join(' · ') }}</span>
        </span>
      </div>
      <h3 class="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug uppercase">
        {{ program.prefix }} {{ program.name }}
      </h3>
      <p class="text-xs text-gray-500">{{ program.courses[0]?.teacher }}</p>
      <div class="mt-auto pt-2 flex items-center justify-between border-t border-gray-100">
        <span :class="program.status_class" class="text-xs font-semibold px-2 py-0.5 rounded-full">{{ program.status_label }}</span>
        <span class="text-base font-bold text-secondary-800">{{ program.price }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { Offer } from '@/types/offer'

  const props = defineProps<{ program: Offer }>()

  const placeholder = new URL('@/assets/course/placeholder.jpg', import.meta.url).href

  const tags = computed(() => props.program.courses[0]?.tags ?? [])
</script>

<style scoped>
  .tooltip-trigger .tooltip {
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.15s;
    position: absolute;
    bottom: calc(100% + 6px);
    left: 0;
    white-space: nowrap;
    background: #1f2937;
    color: #f9fafb;
    font-size: 0.7rem;
    padding: 4px 8px;
    border-radius: 4px;
    pointer-events: none;
    z-index: 10;
  }
  .tooltip-trigger:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
</style>
