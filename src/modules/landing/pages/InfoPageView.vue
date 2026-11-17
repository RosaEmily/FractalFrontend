<script setup lang="ts">
/**
 * Página informativa o legal (privacidad, términos, becas...) cuyo contenido
 * administra el panel en Sitio web → Páginas.
 */
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import LandingLayout from '../layouts/LandingLayout.vue'
import { safeRequest } from '@/shared/utils/request'
import { renderMarkdown } from '@/shared/utils/markdown'
import { pageService } from '../services/page.service'
import type { PageDTO } from '../dto/page.dto'

const route = useRoute()
const router = useRouter()
const page = ref<PageDTO | null>(null)
const loading = ref(true)

async function load(slug: string) {
  loading.value = true
  page.value = null
  const { data } = await safeRequest(() => pageService.get(slug), { showAlert: false })
  page.value = data
  loading.value = false
  if (data) document.title = `${data.title} | Fractal Studio`
}

watch(() => route.params.slug, (slug) => load(String(slug)), { immediate: true })

/*
 * renderMarkdown escapa el HTML y solo deja pasar enlaces seguros: es seguro para v-html.
 *
 * Los enlaces internos del contenido (`/contact`, `/info/...`) se escriben sin la
 * base `/FractalFrontend/` del router; un `<a href="/contact">` suelto daría 404,
 * así que se resuelven contra el router.
 */
const html = computed(() =>
  renderMarkdown(page.value?.content).replace(
    /href="(\/[^"]*)"/g,
    (_, path: string) => `href="${router.resolve(path).href}"`,
  ),
)

/** Navega sin recargar cuando el clic es sobre un enlace interno del contenido. */
function onContentClick(event: MouseEvent) {
  const link = (event.target as HTMLElement).closest('a')
  const href = link?.getAttribute('href')
  const base = router.options.history.base
  if (!link || !href || link.target === '_blank' || event.metaKey || event.ctrlKey) return
  // `base` es `/FractalFrontend` (sin barra final): lo que sigue es la ruta del router.
  if (!href.startsWith(`${base}/`)) return
  event.preventDefault()
  router.push(href.slice(base.length))
}
</script>

<template>
  <LandingLayout>
    <section class="bg-surface-page px-6 md:px-16 py-16 md:py-24 min-h-[60vh]">
      <div class="max-w-3xl mx-auto">
        <div v-if="loading" class="animate-pulse space-y-4" aria-busy="true">
          <div class="h-10 w-2/3 bg-surface-sand rounded-md" />
          <div class="h-4 w-full bg-surface-sand rounded-md" />
          <div class="h-4 w-5/6 bg-surface-sand rounded-md" />
          <div class="h-4 w-4/6 bg-surface-sand rounded-md" />
        </div>

        <article v-else-if="page">
          <h1 class="font-display font-bold text-[clamp(32px,5vw,52px)] leading-[1.05] tracking-tight text-secondary-900 text-balance mb-8">
            {{ page.title }}
          </h1>
          <div
            class="font-body text-[1rem] leading-relaxed text-secondary-600 space-y-4 [&_h2]:font-display [&_h2]:text-[1.5rem] [&_h2]:font-bold [&_h2]:text-secondary-900 [&_h2]:mt-8 [&_h3]:font-display [&_h3]:font-bold [&_h3]:text-secondary-900 [&_h3]:mt-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_a]:text-primary-500 [&_a]:underline [&_strong]:text-secondary-900"
            @click="onContentClick"
            v-html="html"
          />
        </article>

        <div v-else class="text-center py-16">
          <p class="font-mono text-[0.6875rem] tracking-widest uppercase text-secondary-400 mb-3">404</p>
          <h1 class="font-display font-bold text-[2rem] text-secondary-900 mb-3">
            Esta página no está disponible
          </h1>
          <p class="font-body text-secondary-500 mb-6">
            Puede que se haya movido o que todavía no esté publicada.
          </p>
          <RouterLink to="/" class="font-body font-semibold text-primary-500 hover:underline">
            Volver al inicio
          </RouterLink>
        </div>
      </div>
    </section>
  </LandingLayout>
</template>
