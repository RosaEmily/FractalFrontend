<script setup lang="ts">
import { RouterLink } from 'vue-router'
import LandingButton from './ui/LandingButton.vue'
import LandingEyebrow from './ui/LandingEyebrow.vue'
</script>

<template>
  <section class="bg-surface-paper px-6 md:px-16 pt-16 pb-28">
    <!-- Inner accent card -->
    <div class="bg-primary-500 rounded-3xl px-8 md:px-16 py-20 relative overflow-hidden shadow-accent">
      <!-- Decorative circles -->
      <div class="absolute -right-30 -top-30 w-95 h-95 rounded-full bg-white/8 pointer-events-none" />
      <div class="absolute right-10 -bottom-45 w-70 h-70 rounded-full bg-white/6 pointer-events-none" />

      <div class="relative grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-14 items-end">
        <!-- Left: text -->
        <div>
          <LandingEyebrow :index="8" :light="true">EMPIEZA HOY · ASESORÍA GRATUITA</LandingEyebrow>
          <h2 class="font-display font-bold text-[clamp(48px,6vw,80px)] leading-[0.95] tracking-tight text-white text-balance mt-5">
            ¿Listo para tu próximo <span class="italic">nivel</span>?
          </h2>
          <p class="font-body text-[1.0625rem] leading-relaxed text-white/90 mt-5 max-w-lg text-pretty">
            Conversa con un asesor académico. Te ayudamos a elegir el programa que se ajusta a tu rol, experiencia y meta profesional.
          </p>
        </div>

        <!-- Right: CTA + meta -->
        <div class="flex flex-col gap-10">
          <div class="flex flex-col gap-3">
            <RouterLink to="/contact">
              <LandingButton variant="on-accent" size="lg" class="w-full justify-center">
                Hablar con un asesor
              </LandingButton>
            </RouterLink>
            <RouterLink to="/programs">
              <LandingButton variant="on-accent-sec" size="lg" :arrow="false" class="w-full justify-center">
                Ver todos los programas
              </LandingButton>
            </RouterLink>
          </div>

          <!-- Meta -->
          <div class="grid grid-cols-2 gap-5 pt-8 border-t border-white/20">
            <div v-for="([label, value]) in [['Próximo inicio', '15 JUL 2025'], ['Cupos disponibles', '15 / 30'], ['Asesoría', 'Gratuita'], ['Respuesta', '< 24 h']]" :key="label">
              <p class="font-mono text-[0.594rem] tracking-widest uppercase text-white/50">{{ label }}</p>
              <p class="font-display font-bold text-[1.125rem] text-white mt-1">{{ value }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
