<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import LandingLayout from '../layouts/LandingLayout.vue'
import ProgramCard from '../components/programs/ProgramCard.vue'
import ProgramFilters from '../components/programs/ProgramFilters.vue'
import ProgramFilterDrawer from '../components/programs/ProgramFilterDrawer.vue'
import { useOfferStore } from '@/modules/landing/stores/useOfferStore'
import { useToastStore } from '@/shared/stores/useToastStore'
import type { OfferFilterState } from '@/modules/landing/models/offer.model'

const offerStore  = useOfferStore()
const toastStore  = useToastStore()

const PAGE_SIZE   = 9
const currentPage = ref(1)
const drawerOpen  = ref(false)

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

const filters = ref<OfferFilterState>({
  types:         [],
  tags:          [],
  teachers:      [],
  priceRange:    [0, 3000],
  durationRange: [1, 12],
})

const programs   = computed(() => offerStore.data?.offers    ?? [])
const totalCount = computed(() => offerStore.data?.meta?.totalCount ?? programs.value.length)
const totalPages = computed(() => offerStore.data?.meta?.pageCount  ?? 1)

const activeFilterCount = computed(() => {
  let n = 0
  if (filters.value.types.length)    n++
  if (filters.value.tags.length)     n++
  if (filters.value.teachers.length) n++
  if (filters.value.priceRange[0] > 0 || filters.value.priceRange[1] < 3000) n++
  if (filters.value.durationRange[0] > 1 || filters.value.durationRange[1] < 12) n++
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
  offerStore.fetch({
    page:  String(currentPage.value),
    limit: String(PAGE_SIZE),
    order: sortToOrder[sortBy.value] ?? 'enrollment_end_date:desc',
  })
}

function onPageChange(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadPrograms()
}

watch(() => offerStore.error, (err) => { if (err) toastStore.showToastError({ detail: err }) })
watch(sortBy, () => { currentPage.value = 1; loadPrograms() })
watch(filters, () => { currentPage.value = 1; loadPrograms() }, { deep: true })

onMounted(loadPrograms)
</script>

<template>
  <LandingLayout>
    <!-- Page header -->
    <section class="bg-surface-page border-b border-line px-6 md:px-16 py-14">
      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 flex-wrap">
        <div>
          <p class="font-mono text-[0.6875rem] tracking-widest uppercase text-secondary-400 mb-3">CATÁLOGO · 2025</p>
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
          <select
            v-model="sortBy"
            class="px-4 py-2.5 font-body text-[0.844rem] font-medium border border-line rounded-full bg-surface-paper text-secondary-900 cursor-pointer focus:outline-none appearance-none pr-8"
          >
            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
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
        <select
          v-model="sortBy"
          class="font-body text-[0.875rem] border border-line rounded-full px-4 py-2.5 text-secondary-900 bg-surface-paper focus:outline-none cursor-pointer"
        >
          <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>

      <div class="flex gap-8">
        <!-- Sidebar (desktop) -->
        <aside class="hidden lg:block shrink-0" style="width: 280px">
          <div class="sticky top-28 bg-surface-paper border border-line rounded-lg p-6">
            <!-- Sidebar header -->
            <div class="flex items-center justify-between pb-4 mb-5 border-b border-line">
              <span class="font-display text-[0.9375rem] font-bold text-secondary-900 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E94E1B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6H21M6 12H18M9 18H15"/>
                </svg>
                Filtros
              </span>
              <span v-if="activeFilterCount > 0"
                class="font-mono text-[0.625rem] px-2 py-0.5 bg-accent-soft text-primary-500 rounded-full tracking-wide font-semibold">
                {{ activeFilterCount }} activos
              </span>
            </div>

            <ProgramFilters v-model="filters" />

            <button
              v-if="activeFilterCount > 0"
              @click="filters = { types: [], tags: [], teachers: [], priceRange: [0, 3000], durationRange: [1, 12] }"
              class="w-full mt-4 px-4 py-2.5 font-body text-[0.8125rem] font-medium bg-surface-page border border-line rounded-lg text-secondary-700 hover:border-secondary-900 transition-colors text-center"
            >Limpiar filtros</button>
          </div>
        </aside>

        <!-- Grid area -->
        <div class="flex-1 min-w-0">
          <!-- Results header -->
          <div class="flex items-center justify-between mb-6">
            <span class="font-mono text-[0.625rem] tracking-widest uppercase text-secondary-400">
              MOSTRANDO {{ programs.length }} DE {{ totalCount }} PROGRAMAS
            </span>
            <!-- View toggle -->
            <div class="flex gap-1.5">
              <button class="w-9 h-9 bg-secondary-900 text-white rounded-lg flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14"><rect x="1" y="1" width="5" height="5" fill="currentColor"/><rect x="8" y="1" width="5" height="5" fill="currentColor"/><rect x="1" y="8" width="5" height="5" fill="currentColor"/><rect x="8" y="8" width="5" height="5" fill="currentColor"/></svg>
              </button>
              <button class="w-9 h-9 bg-surface-paper text-secondary-900 border border-line rounded-lg flex items-center justify-center hover:bg-surface-cream transition-colors">
                <svg width="14" height="14" viewBox="0 0 14 14"><rect x="1" y="2" width="12" height="2" fill="currentColor"/><rect x="1" y="6" width="12" height="2" fill="currentColor"/><rect x="1" y="10" width="12" height="2" fill="currentColor"/></svg>
              </button>
            </div>
          </div>

          <!-- Skeleton -->
          <div v-if="offerStore.loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            <div v-for="n in PAGE_SIZE" :key="n" class="rounded-lg bg-line-soft animate-pulse aspect-video" />
          </div>

          <template v-else>
            <div v-if="programs.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              <ProgramCard v-for="program in programs" :key="program.id" :program="program" />
            </div>
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
      <ProgramFilters v-model="filters" />
    </ProgramFilterDrawer>
  </LandingLayout>
</template>
