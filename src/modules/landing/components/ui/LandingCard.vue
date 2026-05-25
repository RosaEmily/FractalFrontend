<script setup lang="ts">
withDefaults(defineProps<{ hoverable?: boolean }>(), { hoverable: true })
</script>

<template>
  <div :class="[
    'bg-surface-paper border border-line rounded-lg shadow-sm overflow-hidden',
    hoverable && 'transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-md',
  ]">
    <slot />
  </div>
</template>
