<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import LandingLayout from '../layouts/LandingLayout.vue'
import ProgramCard from '../components/programs/ProgramCard.vue'
import ProgramListRow from '../components/programs/ProgramListRow.vue'
import ProgramFilters from '../components/programs/ProgramFilters.vue'
import ProgramFilterDrawer from '../components/programs/ProgramFilterDrawer.vue'
import { useOfferStore } from '@/modules/landing/stores/useOfferStore'
import { useToastStore } from '@/shared/stores/useToastStore'
import type { OfferFilters, OfferFilterState } from '@/modules/landing/models/offer.model'
import type { OfferQueryParams } from '@/modules/landing/models/offer-query.model'
import { SelectCore } from '@/shared/components'

const offerStore  = useOfferStore()
const toastStore  = useToastStore()

const PAGE_SIZE   = 9
const currentPage = ref(1)
const drawerOpen  = ref(false)
const viewMode    = ref<'grid' | 'list'>('grid')

const sortOptions = [
  { label: 'Más recientes',           value: 'recent'       },
  { label: 'Precio: menor a mayor',   value: 'price_asc'    },
  { label: 'Precio: mayor a menor',   value: 'price_desc'   },
  { label: 'Duración: menor a mayor', value: 'duration_asc' },
  { label: 'Duración: mayor a menor', value: 'duration_desc'},
]
const sortBy = ref('recent')

const sortToOrder: Record<string, string> = {
  recent:        'enrollment_end_date:desc',
  price_asc:     'price:asc',
  price_desc:    'price:desc',
  duration_asc:  'duration_months:asc',
  duration_desc: 'duration_months:desc',
}

/*
 * Límites reales de precio/duración: arrancan en un placeholder de 1 solo
 * valor (rango vacío) hasta que `ProgramFilters` resuelve el endpoint de
 * filtros y emite `ranges-loaded` con `price_range`/`duration_range` de las
 * ofertas activas. `filters.priceRange`/`durationRange` se siembran con esos
 * límites reales en ese momento — no hay `[0,3000]`/`[1,12]` fijos.
 */
const priceBounds    = ref<[number, number]>([0, 0])
const durationBounds = ref<[number, number]>([1, 1])

function emptyFilters(): OfferFilterState {
  return {
    types:         [],
    tags:          [],
    teachers:      [],
    currencies:    [],
    priceRange:    [...priceBounds.value],
    durationRange: [...durationBounds.value],
  }
}

/*
 * `filters` es el BORRADOR que edita el panel (v-model de `ProgramFilters`).
 * `appliedFilters` es lo que realmente se manda al backend — solo cambia
 * cuando el usuario hace clic en "Aplicar filtros" (evento `apply`), nunca
 * en cada clic de un checkbox. Son dos objetos distintos a propósito: si
 * `filters` disparara la búsqueda por sí solo, no habría forma de "editar sin
 * aplicar todavía".
 */
const filters = ref<OfferFilterState>(emptyFilters())
const appliedFilters = ref<OfferFilterState>(emptyFilters())

/*
 * Sidebar (desktop) y drawer (móvil) montan cada uno su `ProgramFilters`, y
 * los dos resuelven el servicio y emiten este evento. La bandera evita que el
 * segundo en responder (drawer abierto después de que el usuario ya movió un
 * slider) le pise el valor elegido — solo siembra una vez.
 */
let rangesSeeded = false

function onRangesLoaded(priceRange: [number, number], durationRange: [number, number]) {
  priceBounds.value = priceRange
  durationBounds.value = durationRange

  if (rangesSeeded) return
  rangesSeeded = true
  filters.value.priceRange = [...priceRange]
  filters.value.durationRange = [...durationRange]
  appliedFilters.value.priceRange = [...priceRange]
  appliedFilters.value.durationRange = [...durationRange]
}

/*
 * Opciones con label legible (sidebar y drawer emiten la misma respuesta del
 * mismo endpoint) — se usan solo para armar el texto de los chips de filtros
 * activos, no para la lógica de filtrado en sí.
 */
const filterOptions = ref<OfferFilters | null>(null)
function onOptionsLoaded(options: OfferFilters) {
  filterOptions.value = options
}

interface ActiveFilterChip {
  key: 'types' | 'tags' | 'teachers' | 'currencies'
  value: string | number
  label: string
}

/** Chips removibles de filtros activos, mostrados arriba del grid. */
const activeFilterChips = computed<ActiveFilterChip[]>(() => {
  const opts = filterOptions.value
  if (!opts) return []

  const chips: ActiveFilterChip[] = []
  const f = appliedFilters.value

  for (const value of f.types) {
    const opt = opts.types.find(o => o.value === value)
    chips.push({ key: 'types', value, label: opt?.label ?? value })
  }
  for (const value of f.tags) {
    const opt = opts.tags.find(o => o.id === value)
    chips.push({ key: 'tags', value, label: opt?.name ?? String(value) })
  }
  for (const value of f.teachers) {
    const opt = opts.teachers.find(o => o.documentNumber === value)
    chips.push({ key: 'teachers', value, label: opt?.name ?? value })
  }
  for (const value of f.currencies) {
    const opt = opts.currencies.find(o => o.id === value)
    chips.push({ key: 'currencies', value, label: opt ? `${opt.name} (${opt.code})` : String(value) })
  }

  return chips
})

function applyFilters() {
  appliedFilters.value = {
    types:         [...filters.value.types],
    tags:          [...filters.value.tags],
    teachers:      [...filters.value.teachers],
    currencies:    [...filters.value.currencies],
    priceRange:    [...filters.value.priceRange],
    durationRange: [...filters.value.durationRange],
  }
  currentPage.value = 1
  loadPrograms()
}

/** Quita un único valor del borrador Y de lo aplicado, y vuelve a buscar. */
function removeFilterValue<K extends 'types' | 'tags' | 'teachers' | 'currencies'>(key: K, value: OfferFilterState[K][number]) {
  const removeFrom = (list: OfferFilterState[K][number][]) => {
    const index = list.indexOf(value)
    if (index !== -1) list.splice(index, 1)
  }
  removeFrom(filters.value[key])
  removeFrom(appliedFilters.value[key])
  currentPage.value = 1
  loadPrograms()
}

/** "Limpiar todo" de la barra de chips: resetea y aplica de una. */
function clearAllFilters() {
  filters.value = emptyFilters()
  appliedFilters.value = emptyFilters()
  currentPage.value = 1
  loadPrograms()
}

const programs   = computed(() => offerStore.data?.offers    ?? [])
const totalCount = computed(() => offerStore.data?.meta?.totalCount ?? programs.value.length)
const totalPages = computed(() => offerStore.data?.meta?.pageCount  ?? 1)

/** Cuenta sobre lo APLICADO (lo que realmente filtra), no sobre el borrador. */
const activeFilterCount = computed(() => {
  const f = appliedFilters.value
  let n = 0
  if (f.types.length)      n++
  if (f.tags.length)       n++
  if (f.teachers.length)   n++
  if (f.currencies.length) n++
  if (f.priceRange[0] > priceBounds.value[0] || f.priceRange[1] < priceBounds.value[1]) n++
  if (f.durationRange[0] > durationBounds.value[0] || f.durationRange[1] < durationBounds.value[1]) n++
  return n
})

const pageNumbers = computed(() => {
  const total = totalPages.value
  const cur   = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | string)[] = [1]
  if (cur > 3) pages.push('...')
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i)
  if (cur < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

function loadPrograms() {
  const f = appliedFilters.value
  const params: OfferQueryParams = {
    page:  String(currentPage.value),
    limit: String(PAGE_SIZE),
    order: sortToOrder[sortBy.value] ?? 'enrollment_end_date:desc',
  }

  if (f.types.length)      params.types      = f.types
  if (f.tags.length)       params.tags       = f.tags
  if (f.teachers.length)   params.teachers   = f.teachers
  if (f.currencies.length) params.currencies = f.currencies

  // Solo se manda price_min/max si el usuario angostó el rango real: mandar
  // siempre los límites completos es inofensivo pero innecesario, y evita
  // filtrar de más si `priceBounds` todavía no cargó (placeholder [0,0]).
  if (f.priceRange[0] > priceBounds.value[0]) params.price_min = f.priceRange[0]
  if (f.priceRange[1] < priceBounds.value[1]) params.price_max = f.priceRange[1]
  if (f.durationRange[0] > durationBounds.value[0]) params.duration_min = f.durationRange[0]
  if (f.durationRange[1] < durationBounds.value[1]) params.duration_max = f.durationRange[1]

  offerStore.fetch(params)
}

function onPageChange(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadPrograms()
}

watch(() => offerStore.error, (err) => { if (err) toastStore.showToastError({ detail: err }) })
watch(sortBy, () => { currentPage.value = 1; loadPrograms() })

onMounted(loadPrograms)
</script>

<template>
  <LandingLayout>
    <!-- Page header -->
    <section class="bg-surface-page border-b border-line px-6 md:px-16 py-14">
      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 flex-wrap">
        <div>
          <p class="font-mono text-[0.6875rem] tracking-widest uppercase text-secondary-400 mb-3">CATÁLOGO · {{ new Date().getFullYear() }}</p>
          <h1 class="font-display font-bold text-[clamp(48px,6vw,72px)] leading-[0.98] tracking-tight text-secondary-900">
            Programas<span class="text-primary-500">.</span>
          </h1>
          <p class="font-body text-[1rem] text-secondary-500 leading-relaxed mt-3 max-w-xl">
            Programas activos en BIM, AutoCAD, Civil 3D y herramientas digitales AEC.
            Filtra por tipo, tag, precio o duración.
          </p>
        </div>

        <!-- Sort (desktop) -->
        <div class="hidden lg:flex items-center gap-3">
          <span class="font-mono text-[0.625rem] tracking-widest uppercase text-secondary-400">ORDENAR POR</span>
          <SelectCore
            v-model="sortBy"
            class="landing-select w-64"
            :options="sortOptions"
            option-label="label"
            option-value="value"
          />
        </div>
      </div>
    </section>

    <!-- Main content -->
    <section class="bg-surface-page px-6 md:px-16 py-10 pb-24">
      <!-- Mobile controls -->
      <div class="flex items-center justify-between mb-8 lg:hidden">
        <button
          @click="drawerOpen = true"
          class="inline-flex items-center gap-2 px-4 py-2.5 border border-line rounded-full font-body text-[0.875rem] font-medium text-secondary-700 bg-surface-paper hover:bg-surface-cream transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6H21M6 12H18M9 18H15"/>
          </svg>
          Filtros
          <span v-if="activeFilterCount > 0"
            class="bg-primary-500 text-white text-[0.625rem] rounded-full w-5 h-5 flex items-center justify-center leading-none font-bold">
            {{ activeFilterCount }}
          </span>
        </button>
        <SelectCore
          v-model="sortBy"
          class="landing-select w-48"
          :options="sortOptions"
          option-label="label"
          option-value="value"
        />
      </div>

      <div class="flex gap-8">
        <!-- Sidebar (desktop) -->
        <aside class="hidden lg:block shrink-0" style="width: 280px">
          <div class="sticky top-10 bg-surface-paper border border-line rounded-lg p-6">
            <!-- Sidebar header -->
            <div class="flex items-center justify-between pb-4 mb-5 border-b border-line">
              <span class="font-display text-[0.9375rem] font-bold text-secondary-900 flex items-center gap-2.5">
                <span class="w-7.5 h-7.5 rounded-md bg-accent-tint text-primary-600 flex items-center justify-center shrink-0">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 5H21L15 12V19L9 21V12L3 5Z"/>
                  </svg>
                </span>
                Filtros
              </span>
              <span v-if="activeFilterCount > 0"
                class="font-mono text-[0.625rem] px-2 py-0.5 bg-accent-soft text-primary-500 rounded-full tracking-wide font-semibold uppercase">
                {{ activeFilterCount }} activos
              </span>
            </div>

            <ProgramFilters v-model="filters" @ranges-loaded="onRangesLoaded" @options-loaded="onOptionsLoaded" @apply="applyFilters" />
          </div>
        </aside>

        <!-- Grid area -->
        <div class="flex-1 min-w-0">
          <!-- Chips de filtros activos -->
          <div v-if="activeFilterChips.length" class="flex flex-wrap items-center gap-2 mb-6">
            <span
              v-for="chip in activeFilterChips"
              :key="`${chip.key}-${chip.value}`"
              class="inline-flex items-center gap-2 pl-3.5 pr-2 py-1.5 bg-surface-paper border border-line rounded-full font-body text-[0.8125rem] font-semibold text-secondary-900 shadow-sm"
            >
              {{ chip.label }}
              <button
                type="button"
                aria-label="Quitar filtro"
                class="w-4.5 h-4.5 rounded-full flex items-center justify-center bg-surface-page text-secondary-500 hover:bg-line-soft transition-colors"
                @click="removeFilterValue(chip.key, chip.value as never)"
              >
                <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1 1L7 7M7 1L1 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              </button>
            </span>
            <button
              type="button"
              class="font-body text-[0.8125rem] font-bold text-primary-500 hover:text-primary-600 transition-colors ml-1"
              @click="clearAllFilters"
            >Limpiar todo</button>
          </div>

          <!-- Results header -->
          <div class="flex items-center justify-between mb-6">
            <span class="font-mono text-[0.625rem] tracking-widest uppercase text-secondary-400">
              MOSTRANDO {{ programs.length }} DE {{ totalCount }} PROGRAMAS
            </span>
            <!-- View toggle -->
            <div class="flex gap-1.5">
              <button
                @click="viewMode = 'grid'"
                :class="[
                  'w-9 h-9 rounded-lg border flex items-center justify-center transition-colors',
                  viewMode === 'grid'
                    ? 'bg-secondary-900 text-white border-secondary-900'
                    : 'bg-surface-paper text-secondary-900 border-line hover:bg-surface-cream',
                ]"
              >
                <svg width="14" height="14" viewBox="0 0 14 14"><rect x="1" y="1" width="5" height="5" fill="currentColor"/><rect x="8" y="1" width="5" height="5" fill="currentColor"/><rect x="1" y="8" width="5" height="5" fill="currentColor"/><rect x="8" y="8" width="5" height="5" fill="currentColor"/></svg>
              </button>
              <button
                @click="viewMode = 'list'"
                :class="[
                  'w-9 h-9 rounded-lg border flex items-center justify-center transition-colors',
                  viewMode === 'list'
                    ? 'bg-secondary-900 text-white border-secondary-900'
                    : 'bg-surface-paper text-secondary-900 border-line hover:bg-surface-cream',
                ]"
              >
                <svg width="14" height="14" viewBox="0 0 14 14"><rect x="1" y="2" width="12" height="2" fill="currentColor"/><rect x="1" y="6" width="12" height="2" fill="currentColor"/><rect x="1" y="10" width="12" height="2" fill="currentColor"/></svg>
              </button>
            </div>
          </div>

          <!-- Skeleton -->
          <div
            v-if="offerStore.loading"
            :class="viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'flex flex-col gap-3.5'"
          >
            <div
              v-for="n in PAGE_SIZE" :key="n"
              class="rounded-lg bg-line-soft animate-pulse"
              :class="viewMode === 'grid' ? 'aspect-video' : 'h-28'"
            />
          </div>

          <template v-else>
            <template v-if="programs.length > 0">
              <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                <ProgramCard v-for="program in programs" :key="program.id" :program="program" />
              </div>
              <div v-else class="flex flex-col gap-3.5">
                <ProgramListRow v-for="program in programs" :key="program.id" :program="program" />
              </div>
            </template>
            <div v-else class="flex flex-col items-center justify-center py-24 text-secondary-400">
              <p class="font-display font-bold text-[1.25rem] text-secondary-700">Sin resultados</p>
              <p class="font-body text-[0.875rem] mt-2">Prueba ajustando los filtros</p>
            </div>
          </template>

          <!-- Pagination -->
          <div v-if="!offerStore.loading && totalPages > 1" class="mt-14 flex items-center justify-center gap-1.5">
            <button
              @click="onPageChange(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-4 py-2.5 font-body text-[0.844rem] font-semibold bg-surface-paper text-secondary-900 border border-line rounded-full hover:bg-surface-cream transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >← Anterior</button>

            <template v-for="page in pageNumbers" :key="page">
              <span v-if="page === '...'" class="w-9 h-9 flex items-center justify-center font-mono text-[0.75rem] text-secondary-400">…</span>
              <button
                v-else
                @click="onPageChange(page as number)"
                :class="[
                  'w-9.5 h-9.5 rounded-full font-body text-[0.875rem] font-semibold border transition-colors',
                  currentPage === page
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-surface-paper text-secondary-900 border-line hover:bg-surface-cream',
                ]"
              >{{ page }}</button>
            </template>

            <button
              @click="onPageChange(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-4 py-2.5 font-body text-[0.844rem] font-semibold bg-secondary-900 text-white border border-secondary-900 rounded-full hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >Siguiente →</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Mobile filter drawer -->
    <ProgramFilterDrawer v-model:open="drawerOpen">
      <ProgramFilters
        v-model="filters"
        @ranges-loaded="onRangesLoaded"
        @options-loaded="onOptionsLoaded"
        @apply="applyFilters(); drawerOpen = false"
      />
    </ProgramFilterDrawer>
  </LandingLayout>
</template>
