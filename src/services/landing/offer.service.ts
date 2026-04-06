import { BaseService } from '../base.service'
import { api } from '../api'
import { LANDING_ENDPOINTS } from '../api.routes'
import type { LandingOfferData, LandingOfferResponse } from '@/types/response/offer'
import type { ILandingOfferRepository } from '@/interfaces/offer.repository'
import type { ApiError } from '@/types/response/api'

export class LandingOfferService extends BaseService implements ILandingOfferRepository {
  constructor() {
    super(api)
  }

  async fetchLandingOfferData(params: Record<string, string>): Promise<LandingOfferData> {
    const res = await this.get<LandingOfferResponse>(LANDING_ENDPOINTS.offers, { params })
    if (!res.success) throw res.error as ApiError
    return res.data
  }
}
