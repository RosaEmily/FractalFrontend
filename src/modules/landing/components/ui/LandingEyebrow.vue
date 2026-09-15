<script setup lang="ts">
withDefaults(defineProps<{
  index?: number
  light?: boolean
}>(), { light: false })
</script>

<template>
  <div class="inline-flex items-center gap-3">
    <span v-if="index !== undefined"
      :class="['font-mono text-[0.6875rem] font-bold px-2 py-1 rounded-sm', light ? 'text-white bg-white/20' : 'text-primary-500 bg-accent-soft']">
      {{ String(index).padStart(2, '0') }}
    </span>
    <span :class="['font-mono text-[0.6875rem] font-semibold tracking-[0.12em] uppercase', light ? 'text-white/70' : 'text-secondary-500']">
      <slot />
    </span>
  </div>
</template>
