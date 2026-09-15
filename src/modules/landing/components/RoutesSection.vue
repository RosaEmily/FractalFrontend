<script setup lang="ts">
import { RouterLink } from 'vue-router'
import LandingSectionHeader from './ui/LandingSectionHeader.vue'
import LandingButton from './ui/LandingButton.vue'

const TRACKS = [
  {
    code: 'BIM',
    name: 'BIM / Modelado',
    count: 8,
    color: '#E94E1B',
    desc: 'Aprende Revit, Navisworks y la metodología BIM completa, desde modelado hasta coordinación.',
  },
  {
    code: 'CAD',
    name: 'AutoCAD / Diseño',
    count: 5,
    color: '#F5A623',
    desc: 'Certifícate oficialmente en AutoCAD 2D, 3D y produce planos con estándares profesionales.',
  },
  {
    code: 'CIVIL',
    name: 'Civil 3D / Infraestructura',
    count: 4,
    color: '#2D9A7D',
    desc: 'Diseña vías, corredores y obras civiles con Civil 3D bajo estándares peruanos.',
  },
  {
    code: 'MEP',
    name: 'MEP / Instalaciones',
    count: 3,
    color: '#2D6FCF',
    desc: 'Modela y coordina instalaciones sanitarias, eléctricas y HVAC en proyectos BIM.',
  },
]
</script>

<template>
  <section class="bg-accent-soft py-24 relative overflow-hidden">
    <!-- Decorative blob -->
    <div class="absolute -left-40 -top-40 w-100 h-100 rounded-full bg-white/50 opacity-50 pointer-events-none" />

    <div class="relative px-6 md:px-16">
      <LandingSectionHeader
        :index="4"
        eyebrow="RUTAS DE APRENDIZAJE · TRAYECTORIAS"
        subtitle="Cada ruta agrupa los cursos que te llevan de cero a especialista en un área específica del rubro AEC. Diseñadas con docentes en activo."
      >
        <template #title>
          Líneas de carrera <span class="text-primary-500 italic">conectadas</span>.
        </template>
        <template #action>
          <RouterLink to="/programs">
            <LandingButton variant="ink" size="md">Diagnóstico vocacional</LandingButton>
          </RouterLink>
        </template>
      </LandingSectionHeader>

      <div class="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <article
          v-for="track in TRACKS"
          :key="track.code"
          class="bg-surface-paper border border-line rounded-lg overflow-hidden shadow-sm hover:-translate-y-1 transition-transform duration-300 flex flex-col"
        >
          <!-- Color header area -->
          <div
            class="relative h-44 overflow-hidden border-b border-line flex items-center justify-center"
            :style="{ background: `linear-gradient(135deg, ${track.color}22 0%, #FFFFFF 100%)` }"
          >
            <!-- Track code top-left -->
            <span
              class="absolute top-3.5 left-3.5 font-mono text-[0.625rem] font-bold tracking-widest uppercase"
              :style="{ color: track.color }"
            >{{ track.code }}</span>

            <!-- Large code as illustration -->
            <span
              class="font-display font-extrabold text-[5rem] leading-none tracking-tight select-none opacity-15"
              :style="{ color: track.color }"
            >{{ track.code }}</span>

            <!-- Program count top-right -->
            <span class="absolute top-3.5 right-3.5 font-mono text-[0.625rem] font-semibold px-2.5 py-1 rounded-full bg-surface-paper border border-line text-secondary-900">
              {{ track.count }} programas
            </span>
          </div>

          <!-- Content -->
          <div class="p-5 flex flex-col flex-1">
            <h3 class="font-display font-bold text-[1.375rem] leading-[1.1] tracking-tight text-secondary-900">
              {{ track.name }}
            </h3>
            <p class="font-body text-[0.844rem] leading-relaxed text-secondary-500 mt-2.5 mb-4 flex-1 text-pretty">
              {{ track.desc }}
            </p>

            <!-- Mini roadmap dots -->
            <div class="flex items-center gap-1 mb-4">
              <template v-for="i in 5" :key="i">
                <span
                  class="w-2.5 h-2.5 rounded-full shrink-0"
                  :style="{ background: i <= 2 ? track.color : '#EBE2D0' }"
                />
                <span
                  v-if="i < 5"
                  class="flex-1 h-0.5"
                  :style="{ background: i <= 1 ? track.color : '#EBE2D0' }"
                />
              </template>
            </div>

            <!-- Link -->
            <RouterLink
              to="/programs"
              class="font-body text-[0.844rem] font-semibold inline-flex items-center gap-1.5 hover:opacity-70 transition-opacity"
              :style="{ color: track.color }"
            >
              Explorar ruta
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 8H13M9 4L13 8L9 12"/>
              </svg>
            </RouterLink>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
