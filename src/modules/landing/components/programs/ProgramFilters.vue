<template>
  <div class="space-y-1">

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-4 py-2">
      <div v-for="n in 4" :key="n" class="space-y-2">
        <div class="h-3 w-24 rounded bg-line-soft animate-pulse" />
        <div class="h-4 w-full rounded bg-line-soft animate-pulse" />
        <div class="h-4 w-3/4 rounded bg-line-soft animate-pulse" />
      </div>
    </div>

    <template v-else>
      <!-- Tipo -->
      <div class="border-b border-line pb-5 mb-5">
        <span class="font-mono text-[0.625rem] tracking-widest uppercase text-secondary-400 mb-3.5 block">Tipo</span>
        <div class="space-y-2.5">
          <ProgramFilterRow
            v-for="opt in filterOptions.types"
            :key="opt.value"
            :label="opt.label"
            :count="opt.count"
            :checked="filters.types.includes(opt.value)"
            @toggle="toggleOption(filters.types, opt.value)"
          />
        </div>
      </div>

      <!-- Tags -->
      <div class="border-b border-line pb-5 mb-5">
        <span class="font-mono text-[0.625rem] tracking-widest uppercase text-secondary-400 mb-3.5 block">Tags</span>
        <div class="space-y-2.5">
          <ProgramFilterRow
            v-for="opt in filterOptions.tags"
            :key="opt.id"
            :label="opt.name"
            :count="opt.count"
            :checked="filters.tags.includes(opt.id)"
            @toggle="toggleOption(filters.tags, opt.id)"
          />
        </div>
      </div>

      <!-- Moneda -->
      <div class="border-b border-line pb-5 mb-5">
        <span class="font-mono text-[0.625rem] tracking-widest uppercase text-secondary-400 mb-3.5 block">Moneda</span>
        <div class="space-y-2.5">
          <ProgramFilterRow
            v-for="opt in filterOptions.currencies"
            :key="opt.id"
            :label="`${opt.name} (${opt.code})`"
            :count="opt.count"
            :checked="filters.currencies.includes(opt.id)"
            @toggle="toggleOption(filters.currencies, opt.id)"
          />
        </div>
      </div>

      <!-- Precio -->
      <div class="border-b border-line pb-5 mb-5">
        <span class="font-mono text-[0.625rem] tracking-widest uppercase text-secondary-400 mb-3.5 block">Precio</span>
        <template v-if="priceHasRange">
          <RangeSlider v-model="filters.priceRange" :min="filterOptions.priceRange.min" :max="filterOptions.priceRange.max" />
          <div class="flex justify-between font-mono text-[0.6875rem] text-secondary-500 mt-3.5">
            <span>{{ filters.priceRange[0].toLocaleString() }}</span>
            <span>{{ filters.priceRange[1].toLocaleString() }}</span>
          </div>
        </template>
        <!-- Un solo valor posible (ej. una única oferta activa): no hay rango que
             mover, así que se muestra el dato fijo en vez de un slider roto
             (min === max hace que PrimeVue divida por cero el porcentaje). -->
        <p v-else class="font-mono text-[0.75rem] text-secondary-500">
          {{ filterOptions.priceRange.min.toLocaleString() }} (único valor disponible)
        </p>
      </div>

      <!-- Duración -->
      <div class="border-b border-line pb-5 mb-5">
        <span class="font-mono text-[0.625rem] tracking-widest uppercase text-secondary-400 mb-3.5 block">Duración (meses)</span>
        <template v-if="durationHasRange">
          <RangeSlider v-model="filters.durationRange" :min="filterOptions.durationRange.min" :max="filterOptions.durationRange.max" />
          <div class="flex justify-between font-mono text-[0.6875rem] text-secondary-500 mt-3.5">
            <span>{{ filters.durationRange[0] }} mes{{ filters.durationRange[0] !== 1 ? 'es' : '' }}</span>
            <span>{{ filters.durationRange[1] }} meses</span>
          </div>
        </template>
        <p v-else class="font-mono text-[0.75rem] text-secondary-500">
          {{ filterOptions.durationRange.min }} mes{{ filterOptions.durationRange.min !== 1 ? 'es' : '' }} (único valor disponible)
        </p>
      </div>

      <!-- Docente -->
      <div>
        <span class="font-mono text-[0.625rem] tracking-widest uppercase text-secondary-400 mb-3.5 block">Docente</span>
        <div class="space-y-2.5">
          <ProgramFilterRow
            v-for="opt in filterOptions.teachers"
            :key="opt.documentNumber"
            :label="opt.name"
            :count="opt.count"
            :checked="filters.teachers.includes(opt.documentNumber)"
            @toggle="toggleOption(filters.teachers, opt.documentNumber)"
          />
        </div>
      </div>

      <!-- Acciones: el panel edita un borrador, nada se aplica hasta el clic -->
      <div class="mt-4.5 flex gap-2.5">
        <button @click="resetFilters(); emit('apply')"
          class="flex-1 font-body text-[0.8125rem] font-medium bg-surface-page border border-line rounded-lg text-secondary-700 hover:border-secondary-900 transition-colors text-center py-2.5">
          Limpiar
        </button>
        <button @click="emit('apply')"
          class="flex-1 font-body text-[0.8125rem] font-semibold bg-primary-500 text-white rounded-lg hover:opacity-90 transition-opacity text-center py-2.5">
          Aplicar filtros
        </button>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import RangeSlider from '../RangeSlider.vue'
  import ProgramFilterRow from './ProgramFilterRow.vue'
  import { offerFiltersService } from '@/modules/landing/services/offer-filters.service'
  import type { OfferFilters, OfferFilterState } from '@/modules/landing/models/offer.model'

  const filters = defineModel<OfferFilterState>({ required: true })

  /**
   * `ranges-loaded`: emite el rango real apenas se conoce (carga inicial),
   * para que `ProgramsView` pueda sembrar `filters.priceRange`/`durationRange`
   * con los límites reales en vez de los `[0,3000]`/`[1,12]` fijos con los que
   * arranca el `ref` antes de que este componente resuelva el servicio.
   *
   * `apply`: el panel solo edita un BORRADOR (`v-model filters`) — nada se
   * busca hasta que el usuario hace clic en "Aplicar filtros". `ProgramsView`
   * escucha este evento para copiar el borrador al filtro realmente aplicado.
   *
   * `options-loaded`: las opciones completas (con label legible), para que
   * `ProgramsView` pueda armar los chips de filtros activos sin volver a
   * pedir el mismo endpoint.
   */
  const emit = defineEmits<{
    'ranges-loaded': [priceRange: [number, number], durationRange: [number, number]]
    'options-loaded': [options: OfferFilters]
    apply: []
  }>()

  const loading = ref(true)

  const EMPTY_FILTERS: OfferFilters = {
    types: [],
    tags: [],
    teachers: [],
    currencies: [],
    priceRange: { min: 0, max: 1 },
    durationRange: { min: 1, max: 1 },
  }

  const filterOptions = ref<OfferFilters>(EMPTY_FILTERS)

  /**
   * Con una sola oferta activa (o varias con el mismo precio/duración),
   * `min === max` y el slider de PrimeVue divide por cero al calcular el
   * porcentaje del segundo thumb — se ve como un único círculo pegado al
   * extremo izquierdo. En ese caso no hay rango que filtrar: se muestra el
   * valor fijo en vez del slider.
   */
  const priceHasRange = computed(() => filterOptions.value.priceRange.max > filterOptions.value.priceRange.min)
  const durationHasRange = computed(() => filterOptions.value.durationRange.max > filterOptions.value.durationRange.min)

  onMounted(async () => {
    const result = await offerFiltersService.get()
    if (result) {
      filterOptions.value = result
      emit(
        'ranges-loaded',
        [result.priceRange.min, result.priceRange.max],
        [result.durationRange.min, result.durationRange.max],
      )
      emit('options-loaded', result)
    }
    loading.value = false
  })

  /**
   * Alterna un valor dentro del array del filtro.
   *
   * `ProgramFilterRow` emite un evento simple (sin booleano), así que la
   * pertenencia se maneja acá. Se muta el array en sitio para no reemplazar
   * el objeto del `defineModel`.
   */
  function toggleOption<T>(list: T[], value: T) {
    const index = list.indexOf(value)

    if (index === -1) list.push(value)
    else list.splice(index, 1)
  }

  function resetFilters() {
    filters.value = {
      types: [],
      tags: [],
      teachers: [],
      currencies: [],
      priceRange: [filterOptions.value.priceRange.min, filterOptions.value.priceRange.max],
      durationRange: [filterOptions.value.durationRange.min, filterOptions.value.durationRange.max],
    }
  }
</script>
