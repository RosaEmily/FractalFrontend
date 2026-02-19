import { BaseService } from '../base.service'
import { api } from '../api'
import { LANDING_ENDPOINTS } from '../api.routes'
import type { LandingFooterData, LandingFooterResponse } from '@/types/response/footer'
import type { ILandingRepository } from '@/interfaces/landing.repository'
import type { ApiError } from '@/types/response/api'

export class LandingFooterService extends BaseService implements ILandingRepository {
  constructor() {
    super(api)
  }

  async fetchLanding(): Promise<LandingFooterData> {
    const res = await this.get<LandingFooterResponse>(LANDING_ENDPOINTS.footer)
    if (!res.success) throw res.error as ApiError
    return res.data
  }
}