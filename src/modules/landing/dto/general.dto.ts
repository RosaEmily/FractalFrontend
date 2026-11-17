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
  whatsapp?: string | null;
  site_name?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
}
