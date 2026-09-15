<template>
  <Navbar class="sticky top-0 z-50" />
  <main>
    <slot />
  </main>
  <Footer
    :contact="contact"
    :social_networks="social_networks"
    :information="information"
    :company="company"
  />
</template>

<script setup lang="ts">
  import { computed, onMounted } from 'vue'
  import Navbar from '../components/NavbarHeader.vue'
  import Footer from '../components/FooterSection.vue'
  import { useFooterStore } from '@/modules/landing/stores/useFooterStore'

  const footerStore = useFooterStore()

  const contact = computed(() => footerStore.data?.contact ?? [])
  const social_networks = computed(() => footerStore.data?.social_networks ?? [])
  const information = computed(() => footerStore.data?.information ?? [])
  const company = computed(() => footerStore.data?.company ?? [])

  onMounted(() => {
    footerStore.load()
  })
</script>
