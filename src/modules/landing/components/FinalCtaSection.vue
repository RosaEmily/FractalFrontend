<script setup lang="ts">
import { RouterLink } from 'vue-router'
import LandingButton from './ui/LandingButton.vue'
import LandingEyebrow from './ui/LandingEyebrow.vue'
import { useSiteContact } from '../composables/useSiteContact'

const { phone, whatsappHref } = useSiteContact()
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

        <!-- Right: CTA. v4 quitó la grilla de "Próximo inicio / Cupos": eran
             fechas y cupos fijos que no salían de ninguna oferta. -->
        <div class="flex flex-col gap-3">
          <RouterLink to="/contact">
            <LandingButton variant="on-accent" size="lg" class="w-full justify-center">
              Solicitar llamada
            </LandingButton>
          </RouterLink>
          <a v-if="phone && whatsappHref()" :href="whatsappHref() ?? undefined" target="_blank" rel="noopener">
            <LandingButton variant="on-accent-sec" size="lg" :arrow="false" class="w-full justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 21L4.5 16.5C2 12 4 6 9 4S20 6 20 12C20 17 14 21 9 18.5L3 21Z" />
              </svg>
              WhatsApp · {{ phone }}
            </LandingButton>
          </a>
          <p class="mt-1 text-center font-mono text-[0.688rem] tracking-[0.04em] text-white/70 uppercase">
            Respondemos en menos de 24h
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
