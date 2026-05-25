<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'accent' | 'tint' | 'soft' | 'paper' | 'ink' | 'success' | 'upcoming' | 'open'
  size?: 'sm' | 'md' | 'lg'
}>(), { variant: 'ink', size: 'md' })
</script>

<template>
  <span :class="[
    'inline-flex items-center gap-1.5 font-mono font-semibold uppercase tracking-widest whitespace-nowrap rounded-full',
    size === 'sm' ? 'px-2.5 py-1 text-[0.656rem]' : size === 'lg' ? 'px-4 py-2 text-[0.8125rem]' : 'px-3 py-1.5 text-[0.719rem]',
    variant === 'accent'   && 'bg-primary-500 text-white',
    variant === 'tint'     && 'bg-accent-tint text-primary-600',
    variant === 'soft'     && 'bg-accent-soft text-primary-600 border border-accent-tint',
    variant === 'paper'    && 'bg-surface-paper text-secondary-900 border border-line',
    variant === 'ink'      && 'bg-secondary-900 text-white',
    variant === 'success'  && 'bg-success-soft text-success-DEFAULT',
    variant === 'upcoming' && 'bg-amber-soft text-amber-DEFAULT',
    variant === 'open'     && 'bg-accent-tint text-primary-600',
  ]">
    <slot />
  </span>
</template>
