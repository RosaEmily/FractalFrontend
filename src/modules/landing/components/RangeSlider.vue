<template>
  <div class="landing-range flex items-center h-5 select-none">
    <Slider
      v-model="value"
      range
      class="w-full"
      :min="min"
      :max="max"
      :step="step ?? 1"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import Slider from 'primevue/slider'

  /**
   * Rango de dos extremos (precio y duración de los filtros de programas).
   *
   * ⚠️ Antes eran DOS `<input type="range">` nativos superpuestos, con el track
   * y los pulgares dibujados a mano en un `<style scoped>`. Además de saltarse
   * el preset `FractalPreset` —que solo aplica a los componentes de PrimeVue—
   * obligaba a sincronizar a mano los dos valores para que no se cruzaran.
   * `Slider range` lo resuelve con un solo control y mantiene el orden por su
   * cuenta.
   *
   * La API del componente NO cambia (`v-model` con la tupla `[min, max]`, más
   * `min`/`max`/`step`), así que las dos llamadas de `ProgramFilters` siguen
   * igual.
   */
  const props = defineProps<{ min: number; max: number; step?: number }>()
  const model = defineModel<[number, number]>({ required: true })

  /**
   * PrimeVue emite `number[]` y el modelo declara una tupla: se normaliza al
   * escribir, y se acota a los límites porque un valor guardado fuera de rango
   * dejaría el pulgar fuera del track.
   */
  const value = computed<number[]>({
    get: () => model.value,
    set: ([low, high]) => {
      model.value = [
        Math.max(props.min, low ?? props.min),
        Math.min(props.max, high ?? props.max),
      ]
    },
  })
</script>
