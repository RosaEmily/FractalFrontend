<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  size?: number
  stroke?: string
  accent?: string
  bg?: string
}>(), {
  size: 220,
  stroke: '#161310',
  accent: '#E94E1B',
  bg: 'transparent',
})

const floors = computed(() =>
  [0, 1, 2, 3].map((i) => {
    const y = 150 - i * 24
    return {
      i,
      top: `M120 ${y - 14} L40 ${y + 11} L120 ${y + 36} L200 ${y + 11} Z`,
      left: `M40 ${y + 11} L40 ${y + 35} L120 ${y + 60} L120 ${y + 36} Z`,
      right: `M200 ${y + 11} L200 ${y + 35} L120 ${y + 60} L120 ${y + 36} Z`,
      gridA: `M80 ${y - 1.5} L160 ${y + 23.5}`,
      gridB: `M160 ${y - 1.5} L80 ${y + 23.5}`,
      winLeftA: `M55 ${y + 18} L95 ${y + 30}`,
      winLeftB: `M55 ${y + 24} L95 ${y + 36}`,
      winRightA: `M145 ${y + 30} L185 ${y + 18}`,
      winRightB: `M145 ${y + 36} L185 ${y + 24}`,
    }
  }),
)
</script>

<template>
  <svg :width="props.size" :height="props.size" viewBox="0 0 240 240" style="overflow: visible">
    <rect v-if="props.bg !== 'transparent'" width="240" height="240" :fill="props.bg" />
    <!-- shadow plane -->
    <path d="M120 220 L40 175 L120 130 L200 175 Z" :fill="props.stroke" opacity="0.06" />

    <!-- base block -->
    <g :stroke="props.stroke" stroke-width="1.4" stroke-linejoin="round" fill="none">
      <g v-for="floor in floors" :key="floor.i">
        <!-- top face -->
        <path :d="floor.top" :fill="floor.i === 3 ? props.accent : '#FBFAF7'" :fill-opacity="floor.i === 3 ? 0.95 : 0.7" />
        <!-- left face -->
        <path :d="floor.left" fill="#FBFAF7" fill-opacity="0.55" />
        <!-- right face -->
        <path :d="floor.right" fill="#FBFAF7" fill-opacity="0.35" />
        <!-- floor grid lines on top -->
        <template v-if="floor.i === 3">
          <path :d="floor.gridA" stroke-width="0.8" opacity="0.6" />
          <path :d="floor.gridB" stroke-width="0.8" opacity="0.6" />
        </template>
        <!-- window slits left -->
        <path :d="floor.winLeftA" stroke-width="0.7" opacity="0.6" />
        <path :d="floor.winLeftB" stroke-width="0.7" opacity="0.4" />
        <!-- window slits right -->
        <path :d="floor.winRightA" stroke-width="0.7" opacity="0.6" />
        <path :d="floor.winRightB" stroke-width="0.7" opacity="0.4" />
      </g>

      <!-- vertical edges -->
      <path d="M40 75 L40 161" stroke-width="1.4" />
      <path d="M120 50 L120 186" stroke-width="1.4" />
      <path d="M200 75 L200 161" stroke-width="1.4" />
    </g>
  </svg>
</template>
