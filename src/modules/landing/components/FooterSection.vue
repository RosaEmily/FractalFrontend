<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSiteContact } from '../composables/useSiteContact'
import FooterBlock from './blocks/FooterBlock.vue'
import { buildFooterView } from '../composables/footerView'

const route = useRoute()

/*
 * Un enlace con ancla a la página en la que ya estás no navega (la URL es la
 * misma), así que el salto se hace acá.
 */
function onLinkClick(event: MouseEvent, href: string) {
  const [path, hash] = href.split('#')
  if (!hash || !path || !route.path.endsWith(path)) return
  const target = document.getElementById(hash)
  if (!target) return
  event.preventDefault()
  target.scrollIntoView({ behavior: 'smooth' })
}

const { email, phone, address, whatsappHref, socialNetworks, footer } = useSiteContact()

const view = computed(() =>
  buildFooterView({
    brandText: footer.value?.brandText,
    legalName: footer.value?.legalName,
    locationText: footer.value?.locationText,
    columns: footer.value?.columns,
    email: email.value,
    phone: phone.value,
    address: address.value,
    whatsappHref: whatsappHref(),
    socialNetworks: socialNetworks.value,
  }),
)
</script>

<template>
  <FooterBlock
    :brand-text="view.brandText"
    :legal-name="view.legalName"
    :location-text="view.locationText"
    :social-links="view.socialLinks"
    :columns="view.columns"
    @link-click="onLinkClick"
  />
</template>
