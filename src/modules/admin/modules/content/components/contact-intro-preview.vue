<script setup lang="ts">
/**
 * Vista previa del encabezado de la página de Contacto con el bloque real de
 * la landing (`ContactIntro`): textos y notas del borrador sobre los canales
 * publicados (Sitio web → Contactos).
 */
import { computed } from "vue";
import ContactIntro, { type ContactCard } from "@/modules/landing/components/blocks/ContactIntro.vue";
import LandingFrame from "./landing-frame.vue";
import { useSiteSnapshot } from "../composables/useSiteSnapshot";

const props = defineProps<{
  eyebrow?: string | null;
  title?: string | null;
  titleAccent?: string | null;
  description?: string | null;
  emailNote?: string | null;
  phoneNote?: string | null;
  addressNote?: string | null;
  whatsappNote?: string | null;
  /** Contacto en edición: reemplaza el del mismo tipo publicado. */
  contact?: { type: string | null; value: string | null } | null;
}>();

const site = useSiteSnapshot();

const pick = (types: string[], published: string | null) =>
  props.contact?.value && props.contact.type && types.includes(props.contact.type)
    ? props.contact.value
    : published;
const email = computed(() => pick(["email"], site.email.value));
const phone = computed(() => pick(["mobile", "phone"], site.phone.value));
const address = computed(() => pick(["address"], site.address.value));

/* Mismos textos de respaldo que `landing/pages/ContactView.vue`. */
const cards = computed<ContactCard[]>(() => {
  const out: (ContactCard | null)[] = [
    email.value
      ? { icon: "mail", label: "EMAIL", value: email.value, sub: props.emailNote || "Respondemos en menos de 24h", href: "#" }
      : null,
    phone.value
      ? { icon: "phone", label: "TELÉFONO", value: phone.value, sub: props.phoneNote || "Lun a Vie · 9am – 7pm", href: "#" }
      : null,
    address.value
      ? { icon: "pin", label: "SEDE", value: address.value, sub: props.addressNote || "Ver en el mapa", href: "#" }
      : null,
    site.whatsapp.value && phone.value
      ? { icon: "whatsapp", label: "WHATSAPP", value: phone.value, sub: props.whatsappNote || "Atención 24/7", href: "#" }
      : null,
  ];
  return out.filter((c): c is ContactCard => c !== null);
});
</script>

<template>
  <LandingFrame :width="760">
    <div class="bg-surface-page px-10 py-12">
      <ContactIntro
        :eyebrow="eyebrow || 'CONTACTO · LIMA · PERÚ'"
        :title="title || 'Conversa con un'"
        :accent="titleAccent || 'asesor académico'"
        :description="description || 'Cuéntanos sobre tu rol, experiencia y meta profesional. Te ayudamos a elegir el programa correcto y resolvemos dudas de matrícula.'"
        :cards="cards"
      />
    </div>
  </LandingFrame>
</template>
