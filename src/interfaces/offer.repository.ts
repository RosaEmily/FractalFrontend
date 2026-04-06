import type { LandingOfferData } from '@/types/response/offer'

export interface ILandingOfferRepository {
  fetchLandingOfferData(params: Record<string, string>): Promise<LandingOfferData>
}