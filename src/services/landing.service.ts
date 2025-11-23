import { BaseService } from './base.service'
import { api } from './api'
import { LANDING_ENDPOINTS } from './api.routes'
import type { LandingData, LandingResponse } from '@/types/response/landing'
import type { ILandingRepository } from '@/interfaces/landing.repository'
import type { ApiError } from '@/types/response/api'

export class LandingService extends BaseService implements ILandingRepository {
  constructor() {
    super(api)
  }

  async fetchLanding(): Promise<LandingData> {
    const res = await this.get<LandingResponse>(LANDING_ENDPOINTS.general)
    if (!res.success) throw res.error as ApiError
    return res.data
  }
}