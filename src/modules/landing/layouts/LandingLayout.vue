<template>
  <!-- El navbar queda quieto arriba y el scroll vive DEBAJO de él, en su propio
       contenedor: la barra de desplazamiento empieza bajo el header en vez de
       recorrer la ventana entera por detrás. -->
  <div class="flex h-dvh flex-col overflow-hidden">
    <Navbar />
    <div ref="scroller" class="min-h-0 flex-1 overflow-y-auto">
      <main>
        <slot />
      </main>
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import Navbar from '../components/NavbarHeader.vue'
  import Footer from '../components/FooterSection.vue'
  import { useGeneralStore } from '../stores/useGeneralStore'

  const route = useRoute()
  const scroller = ref<HTMLElement | null>(null)

  /*
   * El `scrollBehavior` del router sube la VENTANA, que ya no se desplaza. Pasar
   * de un programa a otro reutiliza esta página sin desmontarla, así que sin
   * esto el detalle nuevo se abriría a media altura.
   */
  watch(() => route.path, () => scroller.value?.scrollTo({ top: 0 }))

  /*
   * SEO del sitio público: título y meta descripción salen de Sitio web →
   * Configuración. Sin valores en el panel se conserva el `<title>` del HTML.
   */
  const general = useGeneralStore()
  onMounted(() => general.ensure())
  watch(
    () => general.data,
    (d) => {
      const title = d?.meta_title || d?.site_name
      if (title) document.title = title
      const desc = d?.meta_description
      if (desc) {
        let tag = document.head.querySelector<HTMLMetaElement>('meta[name="description"]')
        if (!tag) {
          tag = document.createElement('meta')
          tag.name = 'description'
          document.head.appendChild(tag)
        }
        tag.content = desc
      }
    },
    { immediate: true },
  )
</script>
