<script setup lang="ts">
/**
 * Pie de página (presentacional). Lo usan la landing (`FooterSection`, que le
 * pasa los datos del sitio) y las vistas previas del panel (Pie de página,
 * Contactos, Redes sociales), que le pasan el borrador: lo que se edita se ve
 * con el mismo marcado que se publica.
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import FooterIcon from '@/shared/components/footer-icon.vue'

export type FooterItem = { label: string; href: string; icon?: string; external?: boolean }
export type FooterColumnView = { title: string; items: FooterItem[] }

const props = defineProps<{
  brandText: string
  legalName: string
  locationText: string
  socialLinks: { name: string; href: string }[]
  columns: FooterColumnView[]
}>()
defineEmits<{ (e: 'link-click', event: MouseEvent, href: string): void }>()

/* Branding + una columna por bloque: el ancho se reparte según cuántas haya. */
const gridColumns = computed(() => `1.5fr repeat(${props.columns.length}, minmax(0, 1fr))`)
</script>

<template>
  <footer class="bg-surface-cream">
    <!-- Contenido principal -->
    <div
      class="pt-16 pb-10 px-6 md:px-16 grid grid-cols-1 md:[grid-template-columns:var(--footer-cols)] gap-12"
      :style="{ '--footer-cols': gridColumns }"
    >
      <!-- Branding -->
      <div>
        <img src="@/assets/fractal.png" alt="Fractal Studio" class="h-10 w-auto" />
        <p class="font-body text-[0.875rem] leading-relaxed text-secondary-500 mt-6 mb-6 max-w-xs">
          {{ brandText }}
        </p>
        <p v-if="socialLinks.length" class="font-mono text-[0.625rem] text-secondary-400 tracking-widest uppercase mb-3">Síguenos</p>
        <div class="flex gap-2">
          <a v-for="s in socialLinks" :key="s.name" :href="s.href" target="_blank" rel="noopener"
            class="w-9 h-9 rounded-full bg-surface-paper border border-line text-secondary-900 inline-flex items-center justify-center hover:-translate-y-0.5 transition-transform duration-200">
            <!-- Facebook -->
            <svg v-if="s.name === 'facebook'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 2H15C13 2 11 4 11 6V9H8V13H11V22H15V13H18L19 9H15V7C15 6.5 15.5 6 16 6H18V2Z"/>
            </svg>
            <!-- Instagram -->
            <svg v-else-if="s.name === 'instagram'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7V7.5"/>
            </svg>
            <!-- LinkedIn -->
            <svg v-else-if="s.name === 'linkedin'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="3"/>
              <path d="M7 10V17M7 7V7.5M11 17V13C11 12 12 11 13 11S15 12 15 13V17M11 11V17" stroke-width="1.5"/>
            </svg>
            <!-- YouTube -->
            <svg v-else-if="s.name === 'youtube'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="6" width="20" height="13" rx="3"/>
              <path d="M10 9L15 12.5L10 16Z" :fill="'currentColor'"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- Columnas -->
      <div v-for="col in columns" :key="col.title">
        <p class="font-mono text-[0.625rem] text-secondary-400 tracking-widest uppercase mb-4">{{ col.title }}</p>
        <ul class="flex flex-col gap-2.5">
          <li v-for="item in col.items" :key="item.label">
            <!-- Internas con RouterLink: un <a href="/contact"> ignora la base
                 `/FractalFrontend/` del router y da 404. -->
            <component
              :is="item.href.startsWith('/') ? RouterLink : 'a'"
              v-bind="item.href.startsWith('/')
                ? { to: item.href }
                : { href: item.href, target: item.external ? '_blank' : '_self', rel: item.external ? 'noopener' : undefined }"
              class="font-body text-[0.844rem] text-secondary-900 inline-flex items-center gap-2 hover:opacity-60 transition-opacity"
              @click="$emit('link-click', $event, item.href)">
              <FooterIcon v-if="item.icon && item.icon !== 'pin' && item.icon !== 'whatsapp'" :name="item.icon" class="shrink-0 text-primary-500" />
              <svg v-else-if="item.icon === 'pin'" width="14" height="14" viewBox="0 0 24 24" fill="none" class="shrink-0 text-primary-500" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22S20 14 20 9A8 8 0 1 0 4 9C4 14 12 22 12 22Z"/><circle cx="12" cy="9" r="3"/></svg>
              <svg v-else-if="item.icon === 'whatsapp'" width="14" height="14" viewBox="0 0 24 24" fill="none" class="shrink-0 text-primary-500" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21L4.5 16.5C2 12 4 6 9 4S20 6 20 12C20 17 14 21 9 18.5L3 21Z"/></svg>
              {{ item.label }}
            </component>
          </li>
        </ul>
      </div>
    </div>

    <!-- Copyright -->
    <div class="mx-6 md:mx-16 py-5 border-t border-line flex flex-col sm:flex-row justify-between items-center gap-3 font-mono text-[0.6875rem] text-secondary-400 tracking-[0.04em]">
      <span>© {{ new Date().getFullYear() }} {{ legalName }} · TODOS LOS DERECHOS RESERVADOS</span>
      <span class="flex items-center gap-4">
        <span>{{ locationText }}</span>
        <span class="text-primary-500 flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-dot" />
          OPERATIVO
        </span>
      </span>
    </div>
  </footer>
</template>
