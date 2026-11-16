<script setup lang="ts">
/**
 * Tarjeta de docente (`V3TeacherCard` del diseño): foto —o iniciales sobre
 * color si no hay—, especialidad y años arriba, grado y nombre sobre la foto,
 * descripción, chips, redes y "Ver perfil".
 *
 * La usan el home (claustro) y el detalle de una línea (equipo docente): antes
 * el detalle tenía su propia versión sin foto ni datos del docente.
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import LandingImage from './ui/LandingImage.vue'

export interface TeacherCardData {
  document_number: string
  first_name: string | null
  last_name: string | null
  photo_url: string | null
  academic_degree_name: string | null
  specialty: string | string[] | null
  experience_years: number | null
  description: string | null
  cv: string | null
  social_networks: { linkedin?: string | null; other?: string | null } | null
}

const props = withDefaults(defineProps<{ teacher: TeacherCardData; index?: number }>(), {
  index: 0,
})

const PALETTES = [
  { bg: '#FFE3D3', fg: '#E94E1B' },
  { bg: '#FFF0D6', fg: '#A56E00' },
  { bg: '#DBF1E9', fg: '#2D9A7D' },
  { bg: '#DCEAFA', fg: '#2D6FCF' },
]

const palette = computed(() => PALETTES[props.index % PALETTES.length]!)

const initials = computed(() =>
  `${props.teacher.first_name?.[0] ?? ''}${props.teacher.last_name?.[0] ?? ''}`.toUpperCase(),
)

const specialtyList = computed<string[]>(() => {
  const value = props.teacher.specialty
  if (!value) return []
  if (Array.isArray(value)) return value
  return value.split(',').map((s) => s.trim()).filter(Boolean)
})
</script>

<template>
<article
  class="bg-surface-paper border border-line rounded-lg overflow-hidden shadow-sm hover:-translate-y-1 transition-transform duration-300 flex flex-col"
>
  <!-- Photo / Placeholder -->
  <div
    class="relative aspect-4/5 flex items-center justify-center overflow-hidden"
    :style="{ background: palette.bg }"
  >
    <!-- Dot pattern overlay -->
    <div
      class="absolute inset-0"
      :style="{
        backgroundImage: `radial-gradient(${palette.fg}26 1px, transparent 1px)`,
        backgroundSize: '14px 14px',
        maskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
      }"
    />

    <LandingImage
      :src="teacher.photo_url"
      :alt="`${teacher.first_name} ${teacher.last_name}`"
      img-class="absolute inset-0 w-full h-full object-cover object-top z-10"
    >
      <span
        class="relative font-display font-extrabold leading-none tracking-tight select-none z-0"
        :style="{ fontSize: '140px', color: palette.fg, letterSpacing: '-0.05em' }"
      >
        {{ initials }}
      </span>
    </LandingImage>

    <!-- Top labels -->
    <div class="absolute top-3.5 left-3.5 right-3.5 flex justify-between items-center z-20">
      <span v-if="teacher.specialty" class="font-mono text-[0.625rem] font-semibold px-2.5 py-1 rounded-full bg-surface-paper border border-line text-secondary-900 truncate max-w-32">
        {{ teacher.specialty.toString().trim() }}
      </span>
      <span v-if="teacher.experience_years != null" class="ml-auto font-mono text-[0.625rem] font-semibold px-2.5 py-1 rounded-full bg-surface-paper border border-line text-secondary-900 flex items-center gap-1">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" class="text-primary-500" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        {{ teacher.experience_years }}+ años
      </span>
    </div>

    <!-- Bottom name overlay -->
    <div
      class="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8 z-20"
      :style="{ background: `linear-gradient(to top, ${palette.bg} 30%, transparent)` }"
    >
      <p class="font-mono text-[0.594rem] tracking-widest uppercase opacity-70" :style="{ color: palette.fg }">
        {{ teacher.academic_degree_name }}
      </p>
      <p class="font-display font-bold text-[1.375rem] leading-[1.05] tracking-tight text-secondary-900 mt-1">
        {{ teacher.first_name }} {{ teacher.last_name }}
      </p>
    </div>
  </div>

  <!-- Card body -->
  <div class="p-5">
    <p v-if="teacher.description" class="font-body text-[0.8125rem] text-secondary-500 mb-3">{{ teacher.description.split('.')[0] }}</p>

    <!-- Specialty chips -->
    <div class="flex flex-wrap gap-1.5">
      <span
        v-for="s in specialtyList.slice(0, 3)"
        :key="s"
        class="font-mono text-[0.594rem] text-secondary-500 font-medium px-2 py-0.5 border border-line rounded tracking-wide"
      >
        {{ s }}
      </span>
    </div>

    <!-- Social row -->
    <div class="flex items-center gap-1.5 mt-4 pt-4 border-t border-line">
      <a
        v-if="teacher.social_networks?.linkedin"
        :href="teacher.social_networks?.linkedin"
        target="_blank"
        class="w-8 h-8 rounded-full bg-surface-page border border-line flex items-center justify-center text-secondary-500 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
          <path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd" fill-rule="evenodd"/>
        </svg>
      </a>
      <a
        v-if="teacher.social_networks?.other"
        :href="teacher.social_networks?.other"
        target="_blank"
        class="w-8 h-8 rounded-full bg-surface-page border border-line flex items-center justify-center text-secondary-500 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      </a>
      <a
        v-if="teacher.cv"
        :href="teacher.cv"
        target="_blank"
        class="w-8 h-8 rounded-full bg-surface-page border border-line flex items-center justify-center text-secondary-500 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7L12 13L22 7"/>
        </svg>
      </a>
      <RouterLink
        :to="{ name: 'instructor-detail', params: { documentNumber: teacher.document_number } }"
        class="ml-auto font-body text-[0.781rem] font-semibold text-primary-500 flex items-center gap-1 hover:opacity-70 transition-opacity"
      >
        Ver perfil
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 8H13M9 4L13 8L9 12"/>
        </svg>
      </RouterLink>
    </div>
  </div>
</article>
</template>
