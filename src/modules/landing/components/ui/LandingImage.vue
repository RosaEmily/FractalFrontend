<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  src?: string | null
  alt?: string
  fallbackSrc?: string
  fallbackText?: string
  imgClass?: string
  fallbackClass?: string
}>()

const failed = ref(false)

const showFallbackText = !props.fallbackSrc
</script>

<template>
  <!-- Con imagen -->
  <template v-if="src && !failed">
    <img
      :src="src"
      :alt="alt"
      :class="imgClass"
      @error="failed = true"
    />
  </template>

  <!-- Fallback imagen (placeholder estático) -->
  <template v-else-if="fallbackSrc">
    <img
      :src="fallbackSrc"
      :alt="alt"
      :class="imgClass"
    />
  </template>

  <!-- Fallback texto/slot -->
  <template v-else>
    <slot>
      <span v-if="fallbackText" :class="fallbackClass">{{ fallbackText }}</span>
    </slot>
  </template>
</template>
