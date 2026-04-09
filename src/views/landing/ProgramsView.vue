<template>
  <LandingLayout>
    <section class="bg-white">
      <div class="mx-auto max-w-7xl px-6 md:px-8 lg:px-10 py-12 sm:py-16 lg:py-24">

        <!-- Encabezado -->
        <div class="mb-8 lg:mb-12 flex items-end justify-between gap-4">
          <h1 class="text-4xl md:text-5xl font-semibold tracking-tight text-secondary-800">
            Programas
          </h1>
          <select v-model="sortBy"
            class="hidden lg:block text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 cursor-pointer">
            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>

        <!-- Mobile: barra superior con botón filtros -->
        <div class="flex items-center justify-between mb-6 lg:hidden">
          <button @click="drawerOpen = true"
            class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
            <AdjustmentsHorizontalIcon class="size-4" />
            Filtros
            <span v-if="activeFilterCount > 0"
              class="bg-primary-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {{ activeFilterCount }}
            </span>
          </button>
          <select v-model="sortBy"
            class="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 cursor-pointer">
            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>

        <!-- Layout principal -->
        <div class="flex gap-8">

          <!-- Sidebar de filtros (lg+) -->
          <aside class="hidden lg:block w-56 shrink-0">
            <div class="sticky top-24">
              <p class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Filtrar por</p>
              <ProgramFilters v-model="filters" />
            </div>
          </aside>

          <!-- Grid de programas -->
          <div class="flex-1 min-w-0">
            <div v-if="programStore.loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <div v-for="n in PAGE_SIZE" :key="n"
                class="rounded-lg bg-gray-100 animate-pulse aspect-4/3" />
            </div>
            <template v-else>
              <div v-if="programs.length > 0"
                class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <ProgramCard v-for="program in programs" :key="program.id" :program="program" />
              </div>
              <div v-else class="flex flex-col items-center justify-center py-24 text-gray-400">
                <p class="text-lg font-medium">Sin resultados</p>
                <p class="text-sm mt-1">Prueba ajustando los filtros</p>
              </div>
            </template>

            <!-- Paginación -->
            <div v-if="totalPages > 1" class="mt-10 flex items-center justify-center gap-1">
              <button
                @click="onPageChange(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                <ChevronLeftIcon class="size-4" />
              </button>

              <template v-for="page in pageNumbers" :key="page">
                <span v-if="page === '...'" class="px-2 py-2 text-sm text-gray-400 select-none">…</span>
                <button v-else
                  @click="onPageChange(page as number)"
                  :class="[
                    'w-9 h-9 rounded-lg text-sm font-medium cursor-pointer',
                    currentPage === page
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  ]">
                  {{ page }}
                </button>
              </template>

              <button
                @click="onPageChange(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                <ChevronRightIcon class="size-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- Drawer mobile -->
    <ProgramFilterDrawer v-model:open="drawerOpen">
      <ProgramFilters v-model="filters" />
    </ProgramFilterDrawer>
  </LandingLayout>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import { AdjustmentsHorizontalIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
  import LandingLayout from '@/layouts/LandingLayout.vue'
  import ProgramCard from '@/components/landing/programs/ProgramCard.vue'
  import ProgramFilters from '@/components/landing/programs/ProgramFilters.vue'
  import ProgramFilterDrawer from '@/components/landing/programs/ProgramFilterDrawer.vue'
  import { useLandingOfferListStore } from '@/stores/landing/offer.store'
  import { useToast } from '@/composables/useToast'
  import type { OfferFilterState } from '@/types/offer'

  const programStore = useLandingOfferListStore()
  const { show: showToast } = useToast()

  const PAGE_SIZE = 6
  const currentPage = ref(1)
  const drawerOpen = ref(false)

  const sortOptions = [
    { label: 'Más recientes', value: 'recent' },
    { label: 'Precio: menor a mayor', value: 'price_asc' },
    { label: 'Precio: mayor a menor', value: 'price_desc' },
    { label: 'Duración: menor a mayor', value: 'duration_asc' },
    { label: 'Duración: mayor a menor', value: 'duration_desc' },
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
    types: [],
    tags: [],
    teachers: [],
    priceRange: [0, 3000],
    durationRange: [1, 12],
  })

  const loadPrograms = () => {
    programStore.fetchLandingOfferList({
      page:  String(currentPage.value),
      limit: String(PAGE_SIZE),
      order: sortToOrder[sortBy.value] ?? 'enrollment_end_date:desc',
    })
  }

  onMounted(loadPrograms)

  watch(() => programStore.error, (err) => {
    if (err) showToast(err.message)
  })

  function onPageChange(page: number) {
    currentPage.value = page
    loadPrograms()
  }

  watch(sortBy, () => {
    currentPage.value = 1
    loadPrograms()
  })

  watch(filters, () => {
    currentPage.value = 1
    loadPrograms()
  }, { deep: true })

  const programs = computed(() => programStore.data?.offers ?? [])
  const totalPages = computed(() => programStore.data?.meta.pageCount ?? 1)

  const activeFilterCount = computed(() => {
    let count = 0
    if (filters.value.types.length) count++
    if (filters.value.tags.length) count++
    if (filters.value.teachers.length) count++
    if (filters.value.priceRange[0] > 0 || filters.value.priceRange[1] < 3000) count++
    if (filters.value.durationRange[0] > 1 || filters.value.durationRange[1] < 12) count++
    return count
  })

  const pageNumbers = computed(() => {
    const total = totalPages.value
    const current = currentPage.value
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const pages: (number | string)[] = [1]
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    pages.push(total)
    return pages
  })
</script>