export interface BannerDTO {
  id: string;
  desktop: string;
  mobile: string;
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

export interface GeneralDTO {
  logo: string;
  banner: BannerDTO[];
  kpis: KpiDTO[];
  partners: PartnerDTO[];
}
