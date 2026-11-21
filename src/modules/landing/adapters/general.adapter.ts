import { safeWebUrl } from "@/shared/utils/safe-url";
import {
  AcademicCapIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  SparklesIcon,
  KeyIcon,
} from "@heroicons/vue/24/outline";
import type { FunctionalComponent } from "vue";
import type { FooterDTO, FooterLinkDTO, GeneralDTO } from "../dto/general.dto";
import { defaultFooterIcon, isFooterIcon } from "@/shared/utils/footer-icons";
import type { FooterContent, General } from "../models/general.model";
import { splitKpiFormat } from "../composables/format";

const KPI_ICONS: FunctionalComponent[] = [
  AcademicCapIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  SparklesIcon,
];

/**
 * Resuelve el destino de cada enlace del pie. Un enlace a una página que ya no
 * está publicada se descarta: mejor sin enlace que uno que lleva a un 404.
 */
/** El ícono elegido en el panel, o el del tipo de enlace si no eligió o el nombre ya no existe. */
const iconOf = (link: FooterLinkDTO, type: FooterLinkDTO["type"]): string =>
  isFooterIcon(link.icon) ? link.icon : defaultFooterIcon(type);

const footerOf = (
  dto: FooterDTO | null | undefined,
  pages: { slug: string }[],
): FooterContent => {
  const cp = dto?.contact_page ?? {};
  const published = new Set(pages.map((p) => p.slug));

  return {
    brandText: dto?.brand_text ?? null,
    legalName: dto?.legal_name ?? null,
    locationText: dto?.location_text ?? null,
    ruc: dto?.ruc ?? null,
    legalAddress: dto?.legal_address ?? null,
    columns: (dto?.columns ?? [])
      .map((column) => ({
        title: column.title,
        links: (column.links ?? []).flatMap((link) => {
          if (link.type === "faqs") {
            return [{ label: link.label, href: "/contact#faqs", external: false, icon: iconOf(link, "faqs") }];
          }
          if (link.type === "page" && link.page && published.has(link.page)) {
            return [{ label: link.label, href: `/info/${encodeURIComponent(link.page)}`, external: false, icon: iconOf(link, "page") }];
          }
          if (link.type === "url" && safeWebUrl(link.url)) {
            return [{ label: link.label, href: safeWebUrl(link.url)!, external: true, icon: iconOf(link, "url") }];
          }
          return [];
        }),
      }))
      .filter((column) => column.links.length > 0),
    contactPage: {
      eyebrow: cp.eyebrow ?? null,
      title: cp.title ?? null,
      titleAccent: cp.title_accent ?? null,
      description: cp.description ?? null,
      emailNote: cp.email_note ?? null,
      phoneNote: cp.phone_note ?? null,
      addressNote: cp.address_note ?? null,
      whatsappNote: cp.whatsapp_note ?? null,
      formNote: cp.form_note ?? null,
    },
  };
};

export const GeneralAdapter = {
  one: (dto: GeneralDTO): General => ({
    logo: dto.logo,
    banner: dto.banner.map((b, i) => ({
      id: b.id,
      desktop: b.desktop,
      mobile: b.mobile,
      image_alt: b.alt_desktop || `Banner número ${i + 1}`,
      tag: b.tag,
      kicker: b.kicker,
      title: b.title,
      sub: b.sub,
      cta: b.cta,
      cta2: b.cta2,
      dark: b.dark,
      meta: b.meta,
    })),
    kpis: dto.kpis.map((k, i) => ({
      id: String(k.id),
      label: k.description,
      value: k.number,
      prefix: splitKpiFormat(k.format).prefix || undefined,
      suffix: splitKpiFormat(k.format).suffix || undefined,
      icon: KPI_ICONS[i] ?? KeyIcon,
    })),
    partners: dto.partners.map((p) => ({
      id: p.id,
      name: p.name,
      image_url: p.image,
      image_alt: p.name,
    })),
    contact: (dto.contact ?? []).map((c) => ({
      type: c.type,
      label: c.description,
      value: c.value,
    })),
    social_networks: (dto.social_networks ?? []).flatMap((n) => {
      const url = safeWebUrl(n.url);
      return url ? [{ name: n.name, url }] : [];
    }),
    faqs: dto.faqs ?? [],
    complaints_book: dto.complaints_book ?? null,
    footer: footerOf(dto.footer, dto.pages ?? []),
    whatsapp: dto.whatsapp ?? null,
    site_name: dto.site_name ?? null,
    meta_title: dto.meta_title ?? null,
    meta_description: dto.meta_description ?? null,
  }),
};
