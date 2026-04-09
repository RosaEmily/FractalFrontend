import type { ApiResponse } from '@/types/response/api'
import type { OfferData } from '@/types/offer'
import type { PaginationMeta } from '@/types/response/pagination'

export interface LandingOfferData {
  offers: OfferData[]
  meta: PaginationMeta
}

export interface LandingOfferResponse extends ApiResponse<LandingOfferData> {
  data: LandingOfferData
}