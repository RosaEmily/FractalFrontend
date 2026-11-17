import {
  AcademicCapIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  SparklesIcon,
  KeyIcon,
} from "@heroicons/vue/24/outline";
import type { FunctionalComponent } from "vue";
import type { FooterDTO, GeneralDTO } from "../dto/general.dto";
import type { FooterContent, General } from "../models/general.model";

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
    columns: (dto?.columns ?? [])
      .map((column) => ({
        title: column.title,
        links: (column.links ?? []).flatMap((link) => {
          if (link.type === "faqs") {
            return [{ label: link.label, href: "/contact#faqs", external: false }];
          }
          if (link.type === "page" && link.page && published.has(link.page)) {
            return [{ label: link.label, href: `/info/${link.page}`, external: false }];
          }
          if (link.type === "url" && link.url) {
            return [{ label: link.label, href: link.url, external: true }];
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
      suffix: k.format.replace('{n}', '').trim() || undefined,
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
    social_networks: (dto.social_networks ?? []).map((n) => ({ name: n.name, url: n.url })),
    faqs: dto.faqs ?? [],
    complaints_book: dto.complaints_book ?? null,
    footer: footerOf(dto.footer, dto.pages ?? []),
    whatsapp: dto.whatsapp ?? null,
    site_name: dto.site_name ?? null,
    meta_title: dto.meta_title ?? null,
    meta_description: dto.meta_description ?? null,
  }),
};
