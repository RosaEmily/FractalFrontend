export interface BannerMetaDTO {
  inicia: string | null;
  duracion: string | null;
  cupos: string | null;
  precio: string | null;
}

export interface BannerDTO {
  id: string;
  desktop: string;
  mobile: string;
  alt_desktop: string | null;
  alt_mobile: string | null;
  tag: string | null;
  kicker: string | null;
  /** Texto libre; la porción entre `**...**` se resalta como acento. */
  title: string | null;
  sub: string | null;
  cta: string | null;
  cta2: string | null;
  dark: boolean;
  meta: BannerMetaDTO | null;
}

export interface KpiDTO {
  id: string;
  description: string;
  number: number;
  format: string;
}

export interface PartnerDTO {
  id: string;
  name: string;
  image: string;
}

export interface ContactDTO {
  id: string;
  description: string;
  isFavorite: boolean;
  type: "email" | "mobile" | "phone" | "address" | "other";
  value: string;
}

export interface SocialNetworkDTO {
  id: string;
  name: string;
  url: string;
}

export interface FaqDTO {
  id: string;
  question: string;
  answer: string;
}

export type FooterLinkType = "page" | "url" | "faqs";

export interface FooterLinkDTO {
  label: string;
  type: FooterLinkType;
  page?: string | null;
  url?: string | null;
  icon?: string | null;
}

/** Pie de página y textos de Contacto, tal cual los guarda el panel (Sitio web → Pie de página). */
export interface FooterDTO {
  brand_text?: string | null;
  legal_name?: string | null;
  location_text?: string | null;
  ruc?: string | null;
  legal_address?: string | null;
  columns?: { title: string; links?: FooterLinkDTO[] }[] | null;
  contact_page?: {
    eyebrow?: string | null;
    title?: string | null;
    title_accent?: string | null;
    description?: string | null;
    email_note?: string | null;
    phone_note?: string | null;
    address_note?: string | null;
    whatsapp_note?: string | null;
    form_note?: string | null;
  } | null;
}

/**
 * Es el JSON del sitio tal cual lo guarda el panel (S3): las claves que el
 * panel todavía no configuró simplemente no llegan, de ahí los opcionales.
 */
export interface GeneralDTO {
  logo: string;
  banner: BannerDTO[];
  kpis: KpiDTO[];
  partners: PartnerDTO[];
  contact?: ContactDTO[];
  social_networks?: SocialNetworkDTO[];
  faqs?: FaqDTO[];
  complaints_book?: string | null;
  /** Solo las publicadas y sin contenido: slug y título. */
  pages?: { slug: string; title: string }[];
  footer?: FooterDTO | null;
  whatsapp?: string | null;
  site_name?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
}
