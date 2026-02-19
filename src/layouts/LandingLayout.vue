<template>
  <Navbar class="sticky top-0 z-50" />
  <main>
    <slot />
  </main>
  <Footer :contact="contact" :social_networks="social_networks" :information="information" :company="company" />
</template>

<script setup>
  import { computed, onMounted } from 'vue'
  import Navbar from '@/components/landing/Navbar.vue'
  import Footer from '@/components/landing/Footer.vue'
  import { useLandingFooterStore } from '@/stores/landing/footer.store'

  const landingFooterStore = useLandingFooterStore()

  const contact = computed(() => landingFooterStore.data?.contact ?? [])
  const social_networks = computed(() => landingFooterStore.data?.social_networks ?? [])
  const information = computed(() => landingFooterStore.data?.information ?? [])
  const company = computed(() => landingFooterStore.data?.company ?? [])

  onMounted(async () => {
    await landingFooterStore.fetchLandingFooter()
    console.log('Data landingFooterStore:', landingFooterStore.data)
    //console.log('obj_contact:', contact.value)
    //console.log('obj_social_networks:', social_networks.value)
    //console.log('obj_information:', information.value)
    //console.log('obj_company:', company.value)
  })
</script>