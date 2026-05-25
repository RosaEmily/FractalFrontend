<script setup lang="ts">
import LandingEyebrow from './LandingEyebrow.vue'

withDefaults(defineProps<{
  index?: number
  eyebrow: string
  subtitle?: string
  align?: 'left' | 'center'
  light?: boolean
}>(), { align: 'left', light: false })
</script>

<template>
  <header :class="['flex flex-wrap gap-8', align === 'center' ? 'flex-col items-center text-center' : 'justify-between items-end']">
    <div class="max-w-2xl">
      <LandingEyebrow :index="index" :light="light">{{ eyebrow }}</LandingEyebrow>
      <h2 :class="[
        'font-display font-bold leading-[0.98] tracking-tight mt-5 text-balance',
        'text-[clamp(40px,5vw,64px)]',
        light ? 'text-white' : 'text-secondary-900',
      ]">
        <slot name="title" />
      </h2>
      <p v-if="subtitle" :class="['font-body text-[1.0625rem] leading-relaxed mt-4 max-w-xl text-pretty', light ? 'text-white/75' : 'text-secondary-500']">
        {{ subtitle }}
      </p>
    </div>
    <div v-if="$slots.action">
      <slot name="action" />
    </div>
  </header>
</template>
