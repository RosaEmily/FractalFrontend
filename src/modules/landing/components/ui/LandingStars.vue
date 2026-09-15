<script setup lang="ts">
withDefaults(defineProps<{ value?: number; size?: number }>(), { value: 5, size: 14 })
</script>

<template>
  <div class="inline-flex gap-0.5">
    <svg v-for="i in 5" :key="i" :width="size" :height="size" viewBox="0 0 14 14" fill="none">
      <defs>
        <linearGradient :id="`star-${i}-${size}`" x1="0" x2="1">
          <stop offset="50%" stop-color="#e94e1b"/>
          <stop offset="50%" stop-color="transparent"/>
        </linearGradient>
      </defs>
      <path d="M7 1 L8.8 5 L13 5.5 L10 8.5 L10.7 13 L7 11 L3.3 13 L4 8.5 L1 5.5 L5.2 5 Z"
        :fill="i <= Math.floor(value) ? '#e94e1b' : (i === Math.ceil(value) && value % 1 >= 0.5 ? `url(#star-${i}-${size})` : 'rgba(0,0,0,0.08)')"
        :stroke="i <= Math.floor(value) || (i === Math.ceil(value) && value % 1 >= 0.5) ? 'none' : '#e94e1b'"
        :stroke-width="i <= Math.floor(value) ? 0 : 0.8"
        stroke-linejoin="round"
        :opacity="i <= Math.floor(value) || (i === Math.ceil(value) && value % 1 >= 0.5) ? 1 : 0.4"/>
    </svg>
  </div>
</template>
