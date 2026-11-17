import {
  AcademicCapIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  SparklesIcon,
  KeyIcon,
} from "@heroicons/vue/24/outline";
import type { FunctionalComponent } from "vue";
import type { GeneralDTO } from "../dto/general.dto";
import type { General } from "../models/general.model";

const KPI_ICONS: FunctionalComponent[] = [
  AcademicCapIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  SparklesIcon,
];

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
    whatsapp: dto.whatsapp ?? null,
    site_name: dto.site_name ?? null,
    meta_title: dto.meta_title ?? null,
    meta_description: dto.meta_description ?? null,
  }),
};
