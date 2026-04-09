<template>
  <div class="relative flex items-center h-5 select-none">
    <div class="absolute w-full h-1.5 rounded-full bg-gray-200" />
    <div class="absolute h-1.5 rounded-full bg-primary-500" :style="fillStyle" />
    <input type="range" :min="min" :max="max" :step="step ?? 1"
      :value="localMin" @input="onMinInput"
      class="thumb absolute w-full" />
    <input type="range" :min="min" :max="max" :step="step ?? 1"
      :value="localMax" @input="onMaxInput"
      class="thumb absolute w-full" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'

  const props = defineProps<{ min: number; max: number; step?: number }>()
  const model = defineModel<[number, number]>({ required: true })

  const localMin = ref(model.value[0])
  const localMax = ref(model.value[1])

  watch(model, ([min, max]) => {
    localMin.value = min
    localMax.value = max
  })

  function onMinInput(e: Event) {
    const val = Number((e.target as HTMLInputElement).value)
    localMin.value = Math.min(val, localMax.value)
    model.value = [localMin.value, localMax.value]
  }

  function onMaxInput(e: Event) {
    const val = Number((e.target as HTMLInputElement).value)
    localMax.value = Math.max(val, localMin.value)
    model.value = [localMin.value, localMax.value]
  }

  const fillStyle = computed(() => {
    const range = props.max - props.min
    const minPct = ((localMin.value - props.min) / range) * 100
    const maxPct = ((localMax.value - props.min) / range) * 100
    return { left: `${minPct}%`, width: `${maxPct - minPct}%` }
  })
</script>

<style scoped>
  input[type='range'].thumb {
    appearance: none;
    -webkit-appearance: none;
    background: transparent;
    pointer-events: none;
    height: 20px;
  }
  input[type='range'].thumb::-webkit-slider-runnable-track { background: transparent; }
  input[type='range'].thumb::-moz-range-track { background: transparent; }
  input[type='range'].thumb::-webkit-slider-thumb {
    -webkit-appearance: none;
    pointer-events: all;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    border: 2px solid var(--color-primary-500);
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  input[type='range'].thumb::-moz-range-thumb {
    pointer-events: all;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    border: 2px solid var(--color-primary-500);
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    border: none;
  }
</style>