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
  import { ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import Navbar from '../components/NavbarHeader.vue'
  import Footer from '../components/FooterSection.vue'

  const route = useRoute()
  const scroller = ref<HTMLElement | null>(null)

  /*
   * El `scrollBehavior` del router sube la VENTANA, que ya no se desplaza. Pasar
   * de un programa a otro reutiliza esta página sin desmontarla, así que sin
   * esto el detalle nuevo se abriría a media altura.
   */
  watch(() => route.path, () => scroller.value?.scrollTo({ top: 0 }))
</script>
