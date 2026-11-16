<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import LandingSectionHeader from './ui/LandingSectionHeader.vue'
import LandingButton from './ui/LandingButton.vue'
import ProgramOfferCard from './ProgramOfferCard.vue'
import type { Offer } from '@/modules/landing/models/offer.model'

const props = defineProps<{ offers: Offer[]; skeleton: boolean }>()

const FILTERS = [
  { label: 'Todos',      type: null },
  { label: 'Cursos',     type: 'course' },
  { label: 'Líneas de carrera', type: 'learning_path' },
]
const activeFilter = ref<string | null>(null)

const filteredOffers = computed(() => {
  if (!activeFilter.value) return props.offers.slice(0, 4)
  return props.offers.filter(o => o.type === activeFilter.value).slice(0, 4)
})
</script>

<template>
  <section v-if="skeleton || offers.length" class="bg-surface-page py-24">
    <div class="px-6 md:px-16">
      <LandingSectionHeader
        :index="3"
:eyebrow="`PROGRAMAS · TEMPORADA ${new Date().getFullYear()}`"
        subtitle="Cursos y líneas de carrera que arrancan este trimestre. Todos respaldados por Autodesk."
      >
        <template #title>
          Últimos <span class="text-primary-500 italic">lanzamientos</span>.
        </template>
        <template #action>
          <RouterLink to="/programs">
            <LandingButton variant="secondary" size="md">Ver todo el catálogo</LandingButton>
          </RouterLink>
        </template>
      </LandingSectionHeader>

      <!-- Filter chips -->
      <div class="flex flex-wrap gap-2 mt-10 mb-9">
        <button
          v-for="f in FILTERS"
          :key="f.label"
          @click="activeFilter = f.type"
          :class="[
            'px-4 py-2.5 font-body text-[0.844rem] font-medium rounded-full border transition-all duration-150',
            activeFilter === f.type
              ? 'bg-secondary-900 text-white border-secondary-900'
              : 'bg-surface-paper text-secondary-900 border-line hover:border-secondary-900',
          ]"
        >
          {{ f.label }}
        </button>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Skeleton -->
        <template v-if="skeleton">
          <div v-for="i in 4" :key="i" class="bg-surface-paper border border-line rounded-lg overflow-hidden animate-pulse flex flex-col">
            <div class="h-50 bg-accent-soft" />
            <div class="p-5 flex flex-col gap-3">
              <div class="h-3 w-20 bg-line rounded" />
              <div class="h-5 w-3/4 bg-line rounded" />
              <div class="h-4 w-1/2 bg-line-soft rounded" />
            </div>
          </div>
        </template>

        <!-- Real offers -->
        <ProgramOfferCard v-else v-for="offer in filteredOffers" :key="offer.id" :offer="offer" />
      </div>

      <!-- El tab elegido no tiene ofertas (distinto de "no hay ninguna oferta": ese
           caso oculta la sección entera, ver el v-if del <section>). -->
      <p v-if="!skeleton && filteredOffers.length === 0" class="font-body text-[0.9375rem] text-secondary-400 text-center py-10">
        No hay {{ activeFilter === 'course' ? 'cursos' : 'líneas de carrera' }} activas por ahora.
      </p>
    </div>
  </section>
</template>
