<template>
  <div class="space-y-1">

    <!-- Tipo -->
    <div class="border-b border-gray-200">
      <button @click="toggle('tipo')" class="w-full flex items-center justify-between py-3 text-sm font-semibold text-gray-700 uppercase tracking-wider">
        Tipo
        <ChevronDownIcon :class="['size-4 transition-transform duration-200', open.tipo ? 'rotate-180' : '']" />
      </button>
      <div v-show="open.tipo" class="pb-3 space-y-2">
        <ToggleCheck
          v-for="opt in filterOptions.tipos"
          :key="opt"
          :label="opt"
          :on="filters.types.includes(opt)"
          @toggle="toggleOption(filters.types, opt)"
        />
      </div>
    </div>

    <!-- Tags -->
    <div class="border-b border-gray-200">
      <button @click="toggle('tags')" class="w-full flex items-center justify-between py-3 text-sm font-semibold text-gray-700 uppercase tracking-wider">
        Tags
        <ChevronDownIcon :class="['size-4 transition-transform duration-200', open.tags ? 'rotate-180' : '']" />
      </button>
      <div v-show="open.tags" class="pb-3 space-y-2">
        <ToggleCheck
          v-for="opt in filterOptions.tags"
          :key="opt"
          :label="opt"
          :on="filters.tags.includes(opt)"
          @toggle="toggleOption(filters.tags, opt)"
        />
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
        <ToggleCheck
          v-for="opt in filterOptions.teachers"
          :key="opt"
          :label="opt"
          :on="filters.teachers.includes(opt)"
          @toggle="toggleOption(filters.teachers, opt)"
        />
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
  import RangeSlider from '../RangeSlider.vue'
  import ToggleCheck from '@/modules/admin/components/ui/toggle-check.vue'
  import type { OfferFilterState } from '@/modules/landing/models/offer.model'

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

  /**
   * Alterna un valor dentro del array del filtro.
   *
   * Los `<input type="checkbox">` nativos lo hacían solos con `v-model` sobre
   * el array; `ToggleCheck` —la casilla del diseño, que es un
   * `<button role="checkbox">`— emite un booleano, así que la pertenencia se
   * maneja acá. Se muta el array en sitio para no reemplazar el objeto del
   * `defineModel`.
   */
  function toggleOption(list: string[], value: string) {
    const index = list.indexOf(value)

    if (index === -1) list.push(value)
    else list.splice(index, 1)
  }

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