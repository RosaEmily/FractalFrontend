<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ink' | 'soft' | 'ghost' | 'on-accent' | 'on-accent-sec'
  size?: 'sm' | 'md' | 'lg'
  arrow?: boolean
  type?: 'button' | 'submit'
}>(), { variant: 'primary', size: 'md', arrow: true, type: 'button' })
</script>

<template>
  <button :type="type" :class="[
    'inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold tracking-tight cursor-pointer transition-all duration-150 hover:-translate-y-px active:translate-y-0 whitespace-nowrap',
    size === 'sm' ? 'px-4 py-2.5 text-[0.8125rem]'   : size === 'lg' ? 'px-7 py-4 text-[0.969rem]' : 'px-5 py-3 text-[0.906rem]',
    variant === 'primary'      && 'bg-primary-500 text-white border-[0.094rem] border-primary-500 shadow-accent hover:bg-primary-600',
    variant === 'secondary'    && 'bg-transparent text-secondary-900 border-[0.094rem] border-secondary-900 hover:bg-secondary-900 hover:text-white',
    variant === 'ink'          && 'bg-secondary-900 text-white border-[0.094rem] border-secondary-900 shadow-md hover:bg-black',
    variant === 'soft'         && 'bg-accent-soft text-primary-600 border-[0.094rem] border-accent-tint hover:bg-accent-tint',
    variant === 'ghost'        && 'bg-transparent text-secondary-900 border-[0.094rem] border-transparent hover:bg-surface-cream',
    variant === 'on-accent'    && 'bg-white text-primary-500 border-[0.094rem] border-white shadow-sm hover:bg-orange-50',
    variant === 'on-accent-sec'&& 'bg-transparent text-white border-[0.094rem] border-white/50 hover:bg-white/10',
  ]">
    <slot />
    <svg v-if="arrow" :width="size === 'lg' ? 16 : 14" :height="size === 'lg' ? 16 : 14"
      viewBox="0 0 16 16" fill="none" class="shrink-0">
      <path d="M3 8H13 M9 4 L13 8 L9 12" stroke="currentColor" stroke-width="1.6"
        stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
</template>
