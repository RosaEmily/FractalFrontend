<script setup lang="ts">
import LandingSectionHeader from './ui/LandingSectionHeader.vue'
import ProgramOfferCard from './ProgramOfferCard.vue'
import type { Offer } from '@/modules/landing/models/offer.model'

/*
 * v4: la sección muestra PROGRAMAS de tipo línea de carrera (ofertas a la
 * venta), no las tarjetas de track de v3 con su código derivado y "Explorar
 * ruta". Sin ninguna línea de carrera activa, la sección no se pinta.
 */
const props = defineProps<{ offers: Offer[]; skeleton: boolean }>()
</script>

<template>
  <section v-if="props.skeleton || props.offers.length" class="bg-accent-soft py-24 relative overflow-hidden">
    <div class="absolute -left-40 -top-40 w-100 h-100 rounded-full bg-accent-soft opacity-50 pointer-events-none" />

    <div class="relative px-6 md:px-16">
      <LandingSectionHeader
        :index="4"
        eyebrow="PROGRAMAS · TRAYECTORIAS COMPLETAS"
        subtitle="Diplomados y especializaciones que agrupan varios cursos en una sola ruta, de cero a especialista, con docentes en activo."
      >
        <template #title>
          Líneas de carrera <span class="text-primary-500">conectadas</span>.
        </template>
      </LandingSectionHeader>

      <div v-if="props.skeleton" class="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
        <div v-for="i in 4" :key="i" class="bg-surface-paper border border-line rounded-lg overflow-hidden shadow-sm flex flex-col">
          <div class="h-50 bg-secondary-900/10" />
          <div class="p-5 flex flex-col gap-3">
            <div class="h-3 w-20 bg-secondary-900/10 rounded" />
            <div class="h-5 w-3/4 bg-secondary-900/10 rounded" />
            <div class="h-4 w-1/2 bg-secondary-900/10 rounded" />
          </div>
        </div>
      </div>

      <div v-else class="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <ProgramOfferCard v-for="offer in props.offers" :key="offer.id" :offer="offer" />
      </div>
    </div>
  </section>
</template>
