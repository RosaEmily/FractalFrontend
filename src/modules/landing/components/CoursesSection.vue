<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import LandingSectionHeader from './ui/LandingSectionHeader.vue'
import LandingButton from './ui/LandingButton.vue'
import type { Offer } from '@/modules/landing/models/offer.model'

const props = defineProps<{ offers: Offer[]; skeleton: boolean }>()

const placeholder = new URL('@/assets/course/placeholder.jpg', import.meta.url).href

const FILTERS = ['Todos', 'Diplomados', 'Certificaciones', 'Especializaciones']
const activeFilter = ref('Todos')

const FILTER_TYPE_MAP: Record<string, string> = {
  Diplomados:        'diploma',
  Certificaciones:   'course',
  Especializaciones: 'specialization',
}

const filteredOffers = computed(() => {
  if (activeFilter.value === 'Todos') return props.offers.slice(0, 4)
  const type = FILTER_TYPE_MAP[activeFilter.value]
  return props.offers.filter(o => o.type === type).slice(0, 4)
})

const STATUS_LABEL: Record<string, string> = {
  open:    'Inscripciones abiertas',
  upcoming:'Próximamente',
  ongoing: 'En curso',
  ended:   'Finalizado',
}
</script>

<template>
  <section class="bg-surface-page py-24">
    <div class="px-6 md:px-16">
      <LandingSectionHeader
        :index="3"
        eyebrow="PROGRAMAS · TEMPORADA 2025"
        subtitle="Diplomados, certificaciones y especializaciones que arrancan este trimestre. Todos respaldados por Autodesk."
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
          :key="f"
          @click="activeFilter = f"
          :class="[
            'px-4 py-2.5 font-body text-[0.844rem] font-medium rounded-full border transition-all duration-150',
            activeFilter === f
              ? 'bg-secondary-900 text-white border-secondary-900'
              : 'bg-surface-paper text-secondary-900 border-line hover:border-secondary-900',
          ]"
        >
          {{ f }}
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
        <RouterLink
          v-else
          v-for="offer in filteredOffers"
          :key="offer.id"
          :to="offer.href || '/programs'"
          class="group bg-surface-paper border border-line rounded-lg overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col"
        >
          <!-- Image: gradient tint bg as placeholder, real image on top -->
          <div class="relative h-50 overflow-hidden"
            :style="{ background: 'linear-gradient(135deg, var(--color-accent-soft) 0%, var(--color-surface-cream) 100%)' }">
            <img
              :src="offer.image_url"
              :alt="offer.name"
              @error="(e) => ((e.target as HTMLImageElement).src = placeholder)"
              class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <!-- Status badge -->
            <div class="absolute top-3.5 left-3.5">
              <span :class="[
                'font-mono text-[0.625rem] font-semibold tracking-wide px-2.5 py-1 rounded-full',
                offer.status === 'open'     ? 'bg-success-DEFAULT text-white' :
                offer.status === 'upcoming' ? 'bg-amber-DEFAULT text-white' :
                offer.status === 'ongoing'  ? 'bg-surface-paper text-secondary-900 border border-line' :
                'bg-secondary-400 text-white',
              ]">
                {{ offer.status_label || STATUS_LABEL[offer.status] }}
              </span>
            </div>
            <!-- Course count badge (if multiple) -->
            <div v-if="offer.courses.length > 1" class="absolute top-3.5 right-3.5">
              <span class="font-mono text-[0.625rem] font-semibold tracking-wide px-2.5 py-1 rounded-full bg-surface-paper border border-line text-secondary-900">
                {{ offer.courses.length }} cursos
              </span>
            </div>
          </div>

          <!-- Content -->
          <div class="p-5 flex flex-col gap-2 flex-1">
            <p class="font-mono text-[0.625rem] tracking-widest uppercase text-secondary-400">{{ offer.prefix }}</p>
            <h3 class="font-display font-bold text-[1.25rem] leading-[1.15] tracking-tight text-secondary-900">
              {{ offer.name }}
            </h3>

            <!-- Tags -->
            <div v-if="offer.courses[0]?.tags?.length" class="flex flex-wrap gap-1.5 mt-2">
              <span
                v-for="tag in offer.courses[0].tags.slice(0, 3)"
                :key="tag"
                class="font-mono text-[0.625rem] text-secondary-500 px-2 py-1 bg-surface-page rounded-md tracking-wide"
              >
                {{ tag }}
              </span>
            </div>

            <!-- Footer -->
            <div class="mt-auto pt-4 border-t border-line-soft flex items-end justify-between">
              <div>
                <p class="font-mono text-[0.594rem] text-secondary-400 tracking-widest uppercase">DESDE</p>
                <p class="font-display font-bold text-[1.375rem] text-secondary-900 tracking-tight">
                  {{ offer.price }}
                </p>
              </div>
              <div class="flex items-center gap-1.5 font-body text-[0.75rem] text-secondary-500">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9"/><path d="M12 7V12L15.5 14"/>
                </svg>
                {{ offer.duration_months }} {{ offer.duration_months === 1 ? 'mes' : 'meses' }}
              </div>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
