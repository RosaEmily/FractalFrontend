import type { ApiResponse } from "@/types/response/api";
import type { Banner } from "@/types/banner";
import type { Kpi } from "@/types/kpi";
import type { Partner } from "@/types/partner";
import type { Contact } from "@/types/contact";
import type { SocialNetwork } from "@/types/social-network";

export interface LandingData {
  logo: string
  banner: Banner[]
  kpis: Kpi[]
  partners: Partner[]
  contact: Contact[]
  social_networks: SocialNetwork[]
  libro_reclamaciones: string
}

export interface LandingResponse extends ApiResponse<LandingData> {
  data: LandingData
}