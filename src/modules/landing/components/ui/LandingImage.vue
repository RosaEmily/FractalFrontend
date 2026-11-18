<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  src?: string | null
  alt?: string
  fallbackSrc?: string
  fallbackText?: string
  imgClass?: string
  fallbackClass?: string
  loading?: 'lazy' | 'eager'
}>()

const failed = ref(false)

watch(() => props.src, () => { failed.value = false })
</script>

<template>
  <!-- Con imagen -->
  <template v-if="src && !failed">
    <img
      :src="src"
      :alt="alt"
      :class="imgClass"
      :loading="loading ?? 'lazy'"
      decoding="async"
      @error="failed = true"
    />
  </template>

  <!-- Fallback imagen (placeholder estático) -->
  <template v-else-if="fallbackSrc">
    <img
      :src="fallbackSrc"
      :alt="alt"
      :class="imgClass"
      :loading="loading ?? 'lazy'"
      decoding="async"
    />
  </template>

  <!-- Fallback texto/slot -->
  <template v-else>
    <slot>
      <span v-if="fallbackText" :class="fallbackClass">{{ fallbackText }}</span>
    </slot>
  </template>
</template>
