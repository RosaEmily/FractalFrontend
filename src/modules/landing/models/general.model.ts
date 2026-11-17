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

export interface FooterLink {
  label: string;
  /** Destino ya resuelto: ruta interna (`/info/...`, `/contact#faqs`) o URL externa. */
  href: string;
  external: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterContent {
  brandText: string | null;
  legalName: string | null;
  locationText: string | null;
  columns: FooterColumn[];
  contactPage: {
    eyebrow: string | null;
    title: string | null;
    titleAccent: string | null;
    description: string | null;
    emailNote: string | null;
    phoneNote: string | null;
    addressNote: string | null;
    whatsappNote: string | null;
    formNote: string | null;
  };
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
  footer: FooterContent;
  whatsapp: string | null;
  site_name: string | null;
  meta_title: string | null;
  meta_description: string | null;
}
