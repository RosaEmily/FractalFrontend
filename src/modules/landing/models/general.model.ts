import type { FunctionalComponent } from "vue";

export interface BannerMeta {
  inicia: string | null;
  duracion: string | null;
  cupos: string | null;
  precio: string | null;
}

export interface Banner {
  id: string;
  desktop: string;
  mobile: string;
  image_alt: string;
  tag: string | null;
  kicker: string | null;
  title: string | null;
  sub: string | null;
  cta: string | null;
  cta2: string | null;
  dark: boolean;
  meta: BannerMeta | null;
}

export interface Kpi {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  icon: FunctionalComponent;
}

export interface Partner {
  id: string;
  name: string;
  image_url: string;
  image_alt: string;
}

export interface SiteContact {
  type: "email" | "mobile" | "phone" | "address" | "other";
  label: string;
  value: string;
}

export interface SocialNetwork {
  name: string;
  url: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
}

export interface General {
  logo: string;
  banner: Banner[];
  kpis: Kpi[];
  partners: Partner[];
  contact: SiteContact[];
  social_networks: SocialNetwork[];
  faqs: Faq[];
  complaints_book: string | null;
  whatsapp: string | null;
}
