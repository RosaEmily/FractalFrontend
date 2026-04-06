import type { ApiResponse } from "@/types/response/api";
import type { BannerData } from "@/types/banner";
import type { KpiData } from "@/types/kpi";
import type { PartnerData } from "@/types/partner";

export interface LandingGeneralData {
  logo: string
  banner: BannerData[]
  kpis: KpiData[]
  partners: PartnerData[]
}

export interface LandingGeneralResponse extends ApiResponse<LandingGeneralData> {
  data: LandingGeneralData
}