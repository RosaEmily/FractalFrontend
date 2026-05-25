export interface BannerDTO {
  id: string;
  desktop: string;
  mobile: string;
}

export interface KpiDTO {
  id: string;
  label: string;
  value: number;
  suffix?: string;
}

export interface PartnerDTO {
  id: string;
  name: string;
  image_url: string;
}

export interface GeneralDTO {
  logo: string;
  banner: BannerDTO[];
  kpis: KpiDTO[];
  partners: PartnerDTO[];
}
