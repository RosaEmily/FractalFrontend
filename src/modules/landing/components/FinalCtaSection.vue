<script setup lang="ts">
import FinalCtaBlock from './blocks/FinalCtaBlock.vue'
import { useSiteContact } from '../composables/useSiteContact'

const { phone, whatsappHref } = useSiteContact()
</script>

<template>
  <FinalCtaBlock :phone="phone" :whatsapp-href="whatsappHref()" />
</template>
