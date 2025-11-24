import type { ApiResponse } from "@/types/response/api";
import type { BannerData } from "@/types/banner";
import type { KpiData } from "@/types/kpi";
import type { PartnerData } from "@/types/partner";
import type { ContactData } from "@/types/contact";
import type { SocialNetworkData } from "@/types/social-network";

export interface LandingData {
  logo: string
  banner: BannerData[]
  kpis: KpiData[]
  partners: PartnerData[]
  contact: ContactData[]
  social_networks: SocialNetworkData[]
  complaints_book: string
}

export interface LandingResponse extends ApiResponse<LandingData> {
  data: LandingData
}