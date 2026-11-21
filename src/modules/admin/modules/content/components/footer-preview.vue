<script setup lang="ts">
/**
 * Vista previa del pie de página con el bloque real de la landing
 * (`FooterBlock`). Parte de lo publicado y le superpone el borrador: textos de
 * marca, columnas de enlaces, un contacto o una red social nuevos.
 */
import { computed } from "vue";
import FooterBlock from "@/modules/landing/components/blocks/FooterBlock.vue";
import { buildFooterView } from "@/modules/landing/composables/footerView";
import { defaultFooterIcon, isFooterIcon } from "@/shared/utils/footer-icons";
import LandingFrame from "./landing-frame.vue";
import { useSiteSnapshot } from "../composables/useSiteSnapshot";
import type { FooterColumnDTO } from "../modules/footer/dto/footer.dto";

const props = defineProps<{
  brandText?: string | null;
  legalName?: string | null;
  locationText?: string | null;
  /** Borrador de las columnas; sin él se usan las publicadas. */
  columns?: FooterColumnDTO[] | null;
  /** Contacto en edición: reemplaza el del mismo tipo publicado. */
  contact?: { type: string | null; value: string | null } | null;
  /** Red social en edición: se suma a las publicadas (o reemplaza a la del mismo nombre). */
  social?: { name: string | null; url: string | null } | null;
}>();

const site = useSiteSnapshot();

/* Igual que `landing/adapters/general.adapter.ts`: ícono elegido o el del tipo. */
const draftColumns = computed(() =>
  props.columns
    ? props.columns.map((column) => ({
        title: column.title || "Título de la columna",
        links: column.links.map((link) => ({
          label: link.label || "Enlace",
          external: link.type === "url",
          href:
            link.type === "faqs"
              ? "/contact#faqs"
              : link.type === "page"
                ? `/info/${link.page ?? ""}`
                : (link.url ?? "#"),
          icon: isFooterIcon(link.icon) ? link.icon! : defaultFooterIcon(link.type),
        })),
      }))
    : undefined,
);

const view = computed(() => {
  const draft = props.contact?.value ? props.contact : null;
  const pick = (types: string[], published: string | null) =>
    draft && draft.type && types.includes(draft.type) ? draft.value : published;

  const socials = site.socialNetworks.value.filter(
    (n) => n.name.toLowerCase() !== props.social?.name?.toLowerCase(),
  );
  if (props.social?.name && props.social.url) {
    socials.push({ name: props.social.name, url: props.social.url });
  }

  return buildFooterView({
    brandText: props.brandText || site.footer.value?.brandText,
    legalName: props.legalName || site.footer.value?.legalName,
    locationText: props.locationText || site.footer.value?.locationText,
    columns: draftColumns.value ?? site.footer.value?.columns,
    email: pick(["email"], site.email.value),
    phone: pick(["mobile", "phone"], site.phone.value),
    address: pick(["address"], site.address.value),
    whatsappHref: site.whatsapp.value
      ? `https://wa.me/${site.whatsapp.value.replace(/\D/g, "")}`
      : null,
    socialNetworks: socials,
  });
});
</script>

<template>
  <LandingFrame :width="1280">
    <FooterBlock
      :brand-text="view.brandText"
      :legal-name="view.legalName"
      :location-text="view.locationText"
      :social-links="view.socialLinks"
      :columns="view.columns"
    />
  </LandingFrame>
</template>
