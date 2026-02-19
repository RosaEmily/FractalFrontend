import { BaseService } from '../base.service'
import { api } from '../api'
import { LANDING_ENDPOINTS } from '../api.routes'
import type { LandingGeneralData, LandingGeneralResponse } from '@/types/response/general'
import type { ILandingRepository } from '@/interfaces/landing.repository'
import type { ApiError } from '@/types/response/api'

export class LandingGeneralService extends BaseService implements ILandingRepository {
  constructor() {
    super(api)
  }

  async fetchLanding(): Promise<LandingGeneralData> {
    const res = await this.get<LandingGeneralResponse>(LANDING_ENDPOINTS.general)
    if (!res.success) throw res.error as ApiError
    return res.data
  }
}