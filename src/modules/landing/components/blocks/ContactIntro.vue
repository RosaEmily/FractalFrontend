<script setup lang="ts">
/**
 * Encabezado de la página de Contacto: etiqueta, título con acento, descripción
 * y las tarjetas de canales. Lo usan `ContactView` y las vistas previas del panel
 * (Sitio web → Pie de página → Contacto y Canales).
 */
export type ContactCard = {
  icon: string
  label: string
  value: string
  sub: string
  href: string
  external?: boolean
}

defineProps<{
  eyebrow: string
  title: string
  accent: string
  description: string
  cards: ContactCard[]
}>()
</script>

<template>
  <div>
          <p class="font-mono text-[0.6875rem] tracking-widest uppercase text-secondary-400 mb-3">{{ eyebrow }}</p>
          <h1 class="font-display font-bold text-[clamp(48px,6vw,72px)] leading-[0.98] tracking-tight text-secondary-900 text-balance">
            {{ title }}<br><span class="text-primary-500">{{ accent }}</span>.
          </h1>
          <p class="font-body text-[1.0625rem] text-secondary-500 leading-relaxed mt-3 mb-9 max-w-lg text-pretty">
            {{ description }}
          </p>

          <!-- Contact cards 2x2 -->
          <div class="grid grid-cols-1 xs:grid-cols-2 gap-3 mb-7">
            <a
              v-for="c in cards"
              :key="c.label"
              :href="c.href"
              :target="c.external ? '_blank' : undefined"
              :rel="c.external ? 'noopener' : undefined"
              class="bg-surface-paper border border-line rounded-lg p-5 hover:border-primary-500/40 hover:shadow-sm transition-all duration-200"
            >
              <div class="flex justify-between items-start mb-2.5">
                <span class="font-mono text-[0.594rem] tracking-widest uppercase text-secondary-400">{{ c.label }}</span>
                <div class="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center text-primary-500 shrink-0">
                  <svg v-if="c.icon === 'mail'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7L12 13L22 7"/>
                  </svg>
                  <svg v-else-if="c.icon === 'phone'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 4L7 4L9 9L7 11C8 14 10 16 13 17L15 15L20 17L20 21C17 22 10 20 7 16C4 12 3 8 3 4Z"/>
                  </svg>
                  <svg v-else-if="c.icon === 'pin'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22S20 14 20 9A8 8 0 1 0 4 9C4 14 12 22 12 22Z"/><circle cx="12" cy="9" r="3"/>
                  </svg>
                  <svg v-else-if="c.icon === 'whatsapp'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 21L4.5 16.5C2 12 4 6 9 4S20 6 20 12C20 17 14 21 9 18.5L3 21Z"/>
                  </svg>
                </div>
              </div>
              <div class="font-display text-[1rem] font-bold text-secondary-900 leading-tight mb-1 break-anywhere">{{ c.value }}</div>
              <div class="font-body text-[0.75rem] text-secondary-400">{{ c.sub }}</div>
            </a>
          </div>
  </div>
</template>
