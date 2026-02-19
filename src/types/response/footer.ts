import type { ApiResponse } from "@/types/response/api";
import type { ContactData } from "@/types/contact";
import type { ItemHrefData } from "@/types/item-href";

export interface LandingFooterData {
  contact: ContactData[]
  social_networks: ItemHrefData[]
  information: ItemHrefData[]
  company: ItemHrefData[]
}

export interface LandingFooterResponse extends ApiResponse<LandingFooterData> {
  data: LandingFooterData
}