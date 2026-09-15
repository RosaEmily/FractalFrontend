<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import LandingLayout from '../layouts/LandingLayout.vue'
import { safeRequest } from '@/shared/utils/request'
import { teacherService } from '@/modules/landing/services/teacher.service'
import type { Teacher } from '@/modules/landing/models/teacher.model'

const teachers     = ref<Teacher[]>([])
const loading      = ref(false)
const search       = ref('')
const activeFilter = ref('Todos')
const currentPage  = ref(1)
const PAGE_SIZE    = 8

const PALETTES = [
  { bg: '#FFE3D3', fg: '#E94E1B' },
  { bg: '#FFF0D6', fg: '#A56E00' },
  { bg: '#DBF1E9', fg: '#2D9A7D' },
  { bg: '#DCEAFA', fg: '#2D6FCF' },
  { bg: '#F4EBD9', fg: '#1F1A14' },
  { bg: '#FFF1E8', fg: '#E94E1B' },
]

const SPECIALTY_FILTERS = ['Todos', 'BIM', 'AutoCAD', 'Civil 3D', 'MEP', 'Visualización']

function initials(t: Teacher) {
  return `${t.first_name?.[0] ?? ''}${t.last_name?.[0] ?? ''}`.toUpperCase()
}

function specialtyList(t: Teacher): string[] {
  if (Array.isArray(t.specialty)) return t.specialty as unknown as string[]
  return (t.specialty as string ?? '').split(',').map((s: string) => s.trim()).filter(Boolean)
}

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return teachers.value.filter(t => {
    const name = `${t.first_name} ${t.last_name}`.toLowerCase()
    const matchName = !q || name.includes(q)
    const specs = specialtyList(t).join(' ').toLowerCase()
    const matchSpec = activeFilter.value === 'Todos' || specs.includes(activeFilter.value.toLowerCase())
    return matchName && matchSpec
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const paginated  = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filtered.value.slice(start, start + PAGE_SIZE)
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

function setFilter(f: string) {
  activeFilter.value = f
  currentPage.value  = 1
}

function goPage(n: number) {
  if (n < 1 || n > totalPages.value) return
  currentPage.value = n
}

onMounted(async () => {
  loading.value = true
  const { data, status } = await safeRequest(() => teacherService.get(), { showAlert: false })
  if (status) teachers.value = data?.teachers ?? []
  loading.value = false
})
</script>

<template>
  <LandingLayout>
    <!-- Page header -->
    <section class="bg-surface-page border-b border-line px-6 md:px-16 py-16 relative overflow-hidden">
      <!-- Decorative circle -->
      <div class="absolute -right-30 -top-30 w-95 h-95 rounded-full bg-accent-soft opacity-50 pointer-events-none" />

      <div class="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 flex-wrap">
        <div>
          <p class="font-mono text-[0.6875rem] tracking-widest uppercase text-secondary-400 mb-3">CLAUSTRO · DOCENTES {{ new Date().getFullYear() }}</p>
          <h1 class="font-display font-bold text-[clamp(48px,6vw,72px)] leading-[0.98] tracking-tight text-secondary-900">
            Instructores<span class="text-primary-500">.</span>
          </h1>
          <p class="font-body text-[1rem] text-secondary-500 leading-relaxed mt-3 max-w-xl text-pretty">
            Profesionales con experiencia coordinando obras reales en Perú y el extranjero. Cada uno certificado por Autodesk en sus especialidades.
          </p>
        </div>

        <!-- Stats pills -->
        <div class="flex gap-4 flex-wrap">
          <div
            v-for="stat in [
              { label: 'DOCENTES',      value: teachers.length || '12', icon: 'graduate' },
              { label: 'ESPECIALIDADES', value: 8,                       icon: 'sparkle'  },
              { label: 'AÑOS PROMEDIO',  value: 11,                      icon: 'clock'    },
            ]"
            :key="stat.label"
            class="bg-surface-paper border border-line rounded-lg px-4 py-3.5 flex items-center gap-3 min-w-35 shadow-sm"
          >
            <div class="w-9 h-9 rounded-lg bg-accent-soft flex items-center justify-center text-primary-500 shrink-0">
              <!-- Graduate icon -->
              <svg v-if="stat.icon === 'graduate'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              <!-- Sparkle icon -->
              <svg v-else-if="stat.icon === 'sparkle'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <!-- Clock icon -->
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/><path d="M12 7V12L15.5 14"/>
              </svg>
            </div>
            <div>
              <div class="font-display font-bold text-[1.375rem] leading-none text-secondary-900">{{ stat.value }}+</div>
              <div class="font-mono text-[0.594rem] tracking-widest uppercase text-secondary-400 mt-1">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Filters + Grid -->
    <section class="bg-surface-page px-6 md:px-16 py-12">
      <!-- Filter row -->
      <div class="flex flex-wrap items-center gap-2 mb-9">
        <span class="font-mono text-[0.625rem] tracking-widest uppercase text-secondary-400">FILTRAR POR ESPECIALIDAD</span>
        <div class="w-px h-4 bg-line mx-1.5" />
        <button
          v-for="f in SPECIALTY_FILTERS"
          :key="f"
          @click="setFilter(f)"
          :class="[
            'px-4 py-2 font-body text-[0.8125rem] font-medium rounded-full border transition-all duration-150',
            activeFilter === f
              ? 'bg-secondary-900 text-white border-secondary-900'
              : 'bg-surface-paper text-secondary-900 border-line hover:border-secondary-900',
          ]"
        >{{ f }}</button>

        <!-- Search -->
        <div class="ml-auto flex items-center gap-2 px-3.5 py-0 bg-surface-paper border border-line rounded-full h-9.5 min-w-52">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="text-secondary-400 shrink-0" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"/><path d="M21 21L16.5 16.5"/>
          </svg>
          <input
            v-model="search"
            @input="currentPage = 1"
            type="text"
            placeholder="Buscar docente..."
            class="border-none bg-transparent outline-none font-body text-[0.8125rem] text-secondary-900 placeholder:text-secondary-400 w-full"
          />
        </div>
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        <div v-for="i in 8" :key="i" class="animate-pulse rounded-lg overflow-hidden bg-surface-paper border border-line">
          <div class="aspect-4/5 bg-line-soft" />
          <div class="p-5 flex flex-col gap-3">
            <div class="h-4 w-3/4 bg-line rounded" />
            <div class="h-3 w-1/2 bg-line-soft rounded" />
          </div>
        </div>
      </div>

      <!-- Grid -->
      <div v-else-if="paginated.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        <article
          v-for="(teacher, i) in paginated"
          :key="teacher.first_name + teacher.last_name"
          class="bg-surface-paper border border-line rounded-lg overflow-hidden shadow-sm hover:-translate-y-1 transition-transform duration-300 flex flex-col"
        >
          <!-- Photo / Placeholder -->
          <div
            class="relative aspect-4/5 flex items-center justify-center overflow-hidden"
            :style="{ background: PALETTES[(i + (currentPage - 1) * PAGE_SIZE) % 6].bg }"
          >
            <!-- Dot pattern -->
            <div
              class="absolute inset-0"
              :style="{
                backgroundImage: `radial-gradient(${PALETTES[(i + (currentPage - 1) * PAGE_SIZE) % 6].fg}26 1px, transparent 1px)`,
                backgroundSize: '14px 14px',
                maskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
              }"
            />

            <!-- Real photo -->
            <img
              v-if="teacher.photo_url"
              :src="teacher.photo_url"
              :alt="`${teacher.first_name} ${teacher.last_name}`"
              @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
              class="absolute inset-0 w-full h-full object-cover object-top z-10"
            />

            <!-- Initials -->
            <span
              class="relative font-display font-extrabold leading-none select-none z-0"
              :style="{ fontSize: '140px', color: PALETTES[(i + (currentPage - 1) * PAGE_SIZE) % 6].fg, letterSpacing: '-0.05em' }"
            >{{ initials(teacher) }}</span>

            <!-- Top chips -->
            <div class="absolute top-3.5 left-3.5 right-3.5 flex justify-between items-center z-20">
              <span class="font-mono text-[0.625rem] font-semibold px-2.5 py-1 rounded-full bg-surface-paper border border-line text-secondary-900 truncate max-w-24">
                {{ specialtyList(teacher)[0] || 'BIM' }}
              </span>
              <span class="font-mono text-[0.625rem] font-semibold px-2.5 py-1 rounded-full bg-surface-paper border border-line text-secondary-900 flex items-center gap-1 shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#E94E1B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {{ teacher.experience_years }}+ años
              </span>
            </div>

            <!-- Bottom name overlay -->
            <div
              class="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8 z-20"
              :style="{ background: `linear-gradient(to top, ${PALETTES[(i + (currentPage - 1) * PAGE_SIZE) % 6].bg} 30%, transparent)` }"
            >
              <p
                class="font-mono text-[0.594rem] tracking-widest uppercase opacity-70"
                :style="{ color: PALETTES[(i + (currentPage - 1) * PAGE_SIZE) % 6].fg }"
              >{{ teacher.academic_degree_name }}</p>
              <p class="font-display font-bold text-[1.375rem] leading-[1.05] tracking-tight text-secondary-900 mt-1">
                {{ teacher.first_name }} {{ teacher.last_name }}
              </p>
            </div>
          </div>

          <!-- Card body -->
          <div class="p-5 flex flex-col flex-1">
            <p class="font-body text-[0.8125rem] text-secondary-500 mb-3">
              {{ teacher.description?.split('.')[0] || 'Docente especializado en BIM y herramientas Autodesk.' }}
            </p>

            <!-- Specialty chips -->
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="s in specialtyList(teacher).slice(0, 3)"
                :key="s"
                class="font-mono text-[0.594rem] text-secondary-500 font-medium px-2 py-0.5 border border-line rounded tracking-wide"
              >{{ s }}</span>
            </div>

            <!-- Social row -->
            <div class="flex items-center gap-1.5 mt-4 pt-4 border-t border-line">
              <a
                v-if="teacher.social_networks?.linkedin"
                :href="teacher.social_networks.linkedin"
                target="_blank"
                class="w-7.5 h-7.5 rounded-full bg-surface-page border border-line flex items-center justify-center text-secondary-500 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd" fill-rule="evenodd"/>
                </svg>
              </a>
              <a
                v-if="teacher.social_networks?.other"
                :href="teacher.social_networks.other"
                target="_blank"
                class="w-7.5 h-7.5 rounded-full bg-surface-page border border-line flex items-center justify-center text-secondary-500 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </a>
              <a
                v-if="teacher.cv"
                :href="teacher.cv"
                target="_blank"
                class="w-7.5 h-7.5 rounded-full bg-surface-page border border-line flex items-center justify-center text-secondary-500 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7L12 13L22 7"/>
                </svg>
              </a>
              <a href="#" class="ml-auto font-body text-[0.781rem] font-semibold text-primary-500 flex items-center gap-1 hover:opacity-70 transition-opacity">
                Ver perfil
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 8H13M9 4L13 8L9 12"/>
                </svg>
              </a>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty -->
      <div v-else class="flex flex-col items-center justify-center py-24 text-secondary-400">
        <p class="font-display font-bold text-[1.25rem] text-secondary-700">Sin resultados</p>
        <p class="font-body text-[0.875rem] mt-2">Prueba con otro nombre o especialidad</p>
      </div>

      <!-- Pagination -->
      <div v-if="!loading && totalPages > 1" class="mt-14 pt-8 border-t border-line flex items-center justify-between gap-4 flex-wrap">
        <span class="font-mono text-[0.625rem] tracking-widest uppercase text-secondary-400">
          MOSTRANDO {{ paginated.length }} DE {{ filtered.length }} INSTRUCTORES
        </span>
        <div class="flex items-center gap-1.5">
          <button
            @click="goPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-4 py-2.5 font-body text-[0.844rem] font-semibold bg-surface-paper text-secondary-900 border border-line rounded-full hover:bg-surface-cream transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >← Anterior</button>

          <template v-for="page in pageNumbers" :key="page">
            <span v-if="page === '...'" class="w-9 h-9 flex items-center justify-center font-mono text-[0.75rem] text-secondary-400">…</span>
            <button
              v-else
              @click="goPage(page as number)"
              :class="[
                'w-9.5 h-9.5 rounded-full font-body text-[0.875rem] font-semibold border transition-colors',
                currentPage === page
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-surface-paper text-secondary-900 border-line hover:bg-surface-cream',
              ]"
            >{{ page }}</button>
          </template>

          <button
            @click="goPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-4 py-2.5 font-body text-[0.844rem] font-semibold bg-secondary-900 text-white border border-secondary-900 rounded-full hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          >Siguiente →</button>
        </div>
      </div>
    </section>
  </LandingLayout>
</template>
