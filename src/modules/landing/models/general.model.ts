import type { FunctionalComponent } from "vue";

export interface Banner {
  id: string;
  desktop: string;
  mobile: string;
  image_alt: string;
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

export interface General {
  logo: string;
  banner: Banner[];
  kpis: Kpi[];
  partners: Partner[];
}
