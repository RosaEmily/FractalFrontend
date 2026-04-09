<template>
  <div class="space-y-1">

    <!-- Tipo -->
    <div class="border-b border-gray-200">
      <button @click="toggle('tipo')" class="w-full flex items-center justify-between py-3 text-sm font-semibold text-gray-700 uppercase tracking-wider">
        Tipo
        <ChevronDownIcon :class="['size-4 transition-transform duration-200', open.tipo ? 'rotate-180' : '']" />
      </button>
      <div v-show="open.tipo" class="pb-3 space-y-2">
        <label v-for="opt in filterOptions.tipos" :key="opt"
          class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-primary-600">
          <input type="checkbox" :value="opt" v-model="filters.types"
            class="rounded border-gray-300 accent-primary-500" />
          {{ opt }}
        </label>
      </div>
    </div>

    <!-- Tags -->
    <div class="border-b border-gray-200">
      <button @click="toggle('tags')" class="w-full flex items-center justify-between py-3 text-sm font-semibold text-gray-700 uppercase tracking-wider">
        Tags
        <ChevronDownIcon :class="['size-4 transition-transform duration-200', open.tags ? 'rotate-180' : '']" />
      </button>
      <div v-show="open.tags" class="pb-3 space-y-2">
        <label v-for="opt in filterOptions.tags" :key="opt"
          class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-primary-600">
          <input type="checkbox" :value="opt" v-model="filters.tags"
            class="rounded border-gray-300 accent-primary-500" />
          {{ opt }}
        </label>
      </div>
    </div>

    <!-- Precio -->
    <div class="border-b border-gray-200">
      <button @click="toggle('precio')" class="w-full flex items-center justify-between py-3 text-sm font-semibold text-gray-700 uppercase tracking-wider">
        Precio (soles)
        <ChevronDownIcon :class="['size-4 transition-transform duration-200', open.precio ? 'rotate-180' : '']" />
      </button>
      <div v-show="open.precio" class="pb-4 space-y-3">
        <div class="flex justify-between text-xs text-gray-500">
          <span>S/ {{ filters.priceRange[0].toLocaleString() }}</span>
          <span>S/ {{ filters.priceRange[1].toLocaleString() }}</span>
        </div>
        <RangeSlider v-model="filters.priceRange" :min="PRICE_MIN" :max="PRICE_MAX" :step="50" />
      </div>
    </div>

    <!-- Duración -->
    <div class="border-b border-gray-200">
      <button @click="toggle('duracion')" class="w-full flex items-center justify-between py-3 text-sm font-semibold text-gray-700 uppercase tracking-wider">
        Duración (meses)
        <ChevronDownIcon :class="['size-4 transition-transform duration-200', open.duracion ? 'rotate-180' : '']" />
      </button>
      <div v-show="open.duracion" class="pb-4 space-y-3">
        <div class="flex justify-between text-xs text-gray-500">
          <span>{{ filters.durationRange[0] }} mes{{ filters.durationRange[0] !== 1 ? 'es' : '' }}</span>
          <span>{{ filters.durationRange[1] }} meses</span>
        </div>
        <RangeSlider v-model="filters.durationRange" :min="DURATION_MIN" :max="DURATION_MAX" />
      </div>
    </div>

    <!-- Docente -->
    <div class="border-b border-gray-200">
      <button @click="toggle('docente')" class="w-full flex items-center justify-between py-3 text-sm font-semibold text-gray-700 uppercase tracking-wider">
        Docente
        <ChevronDownIcon :class="['size-4 transition-transform duration-200', open.docente ? 'rotate-180' : '']" />
      </button>
      <div v-show="open.docente" class="pb-3 space-y-2">
        <label v-for="opt in filterOptions.teachers" :key="opt"
          class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-primary-600">
          <input type="checkbox" :value="opt" v-model="filters.teachers"
            class="rounded border-gray-300 accent-primary-500" />
          {{ opt }}
        </label>
      </div>
    </div>

    <!-- Reset -->
    <button @click="resetFilters"
      class="mt-4 w-full text-xs font-semibold uppercase tracking-wider text-primary-500 hover:text-primary-700 py-2 cursor-pointer">
      Limpiar filtros
    </button>

  </div>
</template>

<script setup lang="ts">
  import { reactive } from 'vue'
  import { ChevronDownIcon } from '@heroicons/vue/24/solid'
  import RangeSlider from '@/components/ui/RangeSlider.vue'
  import type { OfferFilterState } from '@/types/offer'

  const PRICE_MIN = 0
  const PRICE_MAX = 3000
  const DURATION_MIN = 1
  const DURATION_MAX = 12

  const filterOptions = {
    tipos: ['Curso', 'Línea de carrera'],
    tags: ['BIM', 'AutoCAD', 'Revit', 'Dynamo', 'Gestión', 'Infraestructura', 'Sostenibilidad', 'Digital'],
    teachers: ['Owen Rodriguez Lopez', 'Maité Avalos Soplopuco', 'Jonathan Picon Torres', 'Nixon Delgado Toro', 'Juan Carlos Santamaria'],
  }

  const filters = defineModel<OfferFilterState>({ required: true })

  const open = reactive({
    tipo: true,
    tags: false,
    precio: false,
    duracion: false,
    docente: false,
  })

  function toggle(key: keyof typeof open) {
    open[key] = !open[key]
  }

  function resetFilters() {
    filters.value = {
      types: [],
      tags: [],
      teachers: [],
      priceRange: [PRICE_MIN, PRICE_MAX],
      durationRange: [DURATION_MIN, DURATION_MAX],
    }
  }
</script>