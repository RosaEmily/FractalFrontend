<script setup lang="ts">
import { RouterLink } from 'vue-router'
import LandingSectionHeader from './ui/LandingSectionHeader.vue'
import LandingButton from './ui/LandingButton.vue'
import LandingImage from './ui/LandingImage.vue'
import type { Teacher } from '@/modules/landing/models/teacher.model'

defineProps<{ teachers: Teacher[]; skeleton: boolean }>()

const placeholder = new URL('@/assets/teacher/placeholder.jpg', import.meta.url).href

const PALETTES = [
  { bg: '#FFE3D3', fg: '#E94E1B' },
  { bg: '#FFF0D6', fg: '#A56E00' },
  { bg: '#DBF1E9', fg: '#2D9A7D' },
  { bg: '#DCEAFA', fg: '#2D6FCF' },
]

function initials(t: Teacher) {
  return `${t.first_name[0] ?? ''}${t.last_name[0] ?? ''}`.toUpperCase()
}

function specialtyList(t: Teacher): string[] {
  if (Array.isArray(t.specialty)) return t.specialty as unknown as string[]
  return (t.specialty as string).split(',').map((s: string) => s.trim()).filter(Boolean)
}
</script>

<template>
  <section class="bg-surface-page py-24">
    <div class="px-6 md:px-16">
      <LandingSectionHeader
        :index="5"
        eyebrow="CLAUSTRO · DOCENTES EN ACTIVO"
        subtitle="Profesionales que diseñan, modelan y coordinan obras BIM en Perú y el extranjero. No solo enseñan: ejercen."
      >
        <template #title>
          Aprende con <span class="text-primary-500 italic">expertos</span><br>que coordinan obras reales.
        </template>
        <template #action>
          <RouterLink to="/instructors">
            <LandingButton variant="secondary" size="md">Ver claustro completo</LandingButton>
          </RouterLink>
        </template>
      </LandingSectionHeader>

      <div class="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Skeleton -->
        <template v-if="skeleton">
          <div v-for="i in 4" :key="i" class="bg-surface-paper border border-line rounded-lg overflow-hidden shadow-sm animate-pulse">
            <div class="aspect-4/5 bg-line-soft" />
            <div class="p-5 flex flex-col gap-3">
              <div class="h-4 w-3/4 bg-line rounded" />
              <div class="h-3 w-1/2 bg-line-soft rounded" />
              <div class="flex gap-2 mt-2">
                <div class="h-5 w-12 bg-line-soft rounded" />
                <div class="h-5 w-16 bg-line-soft rounded" />
              </div>
            </div>
          </div>
        </template>

        <!-- Real teachers -->
        <article
          v-else
          v-for="(teacher, i) in teachers.slice(0, 4)"
          :key="teacher.first_name"
          class="bg-surface-paper border border-line rounded-lg overflow-hidden shadow-sm hover:-translate-y-1 transition-transform duration-300 flex flex-col"
        >
          <!-- Photo / Placeholder -->
          <div
            class="relative aspect-4/5 flex items-center justify-center overflow-hidden"
            :style="{ background: PALETTES[i % 4].bg }"
          >
            <!-- Dot pattern overlay -->
            <div
              class="absolute inset-0"
              :style="{
                backgroundImage: `radial-gradient(${PALETTES[i % 4].fg}26 1px, transparent 1px)`,
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
                :style="{ fontSize: '140px', color: PALETTES[i % 4].fg, letterSpacing: '-0.05em' }"
              >
                {{ initials(teacher) }}
              </span>
            </LandingImage>

            <!-- Top labels -->
            <div class="absolute top-3.5 left-3.5 right-3.5 flex justify-between items-center z-20">
              <span class="font-mono text-[0.625rem] font-semibold px-2.5 py-1 rounded-full bg-surface-paper border border-line text-secondary-900">
                {{ teacher.specialty?.toString().split(',')[0]?.trim() || 'BIM' }}
              </span>
              <span class="font-mono text-[0.625rem] font-semibold px-2.5 py-1 rounded-full bg-surface-paper border border-line text-secondary-900 flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#e94e1b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {{ teacher.experience_years }}+ años
              </span>
            </div>

            <!-- Bottom name overlay -->
            <div
              class="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8 z-20"
              :style="{ background: `linear-gradient(to top, ${PALETTES[i % 4].bg} 30%, transparent)` }"
            >
              <p class="font-mono text-[0.594rem] tracking-widest uppercase opacity-70" :style="{ color: PALETTES[i % 4].fg }">
                {{ teacher.academic_degree_name }}
              </p>
              <p class="font-display font-bold text-[1.375rem] leading-[1.05] tracking-tight text-secondary-900 mt-1">
                {{ teacher.first_name }} {{ teacher.last_name }}
              </p>
            </div>
          </div>

          <!-- Card body -->
          <div class="p-5">
            <p class="font-body text-[0.8125rem] text-secondary-500 mb-3">{{ teacher.description?.split('.')[0] || 'Docente especializado en BIM y herramientas Autodesk.' }}</p>

            <!-- Specialty chips -->
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="s in specialtyList(teacher).slice(0, 3)"
                :key="s"
                class="font-mono text-[0.594rem] text-secondary-500 font-medium px-2 py-0.5 border border-line rounded tracking-wide"
              >
                {{ s }}
              </span>
            </div>

            <!-- Social row -->
            <div class="flex items-center gap-1.5 mt-4 pt-4 border-t border-line">
              <a
                v-if="teacher.social_networks.linkedin"
                :href="teacher.social_networks.linkedin"
                target="_blank"
                class="w-8 h-8 rounded-full bg-surface-page border border-line flex items-center justify-center text-secondary-500 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd" fill-rule="evenodd"/>
                </svg>
              </a>
              <a
                v-if="teacher.social_networks.other"
                :href="teacher.social_networks.other"
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
                to="/instructors"
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
      </div>
    </div>
  </section>
</template>
