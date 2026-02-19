import { BaseService } from '../base.service'
import { api } from '../api'
import { LANDING_ENDPOINTS } from '../api.routes'
import type { LandingGeneralData, LandingGeneralResponse } from '@/types/response/general'
import type { ILandingGeneralRepository } from '@/interfaces/general.repository'
import type { ApiError } from '@/types/response/api'

export class LandingGeneralService extends BaseService implements ILandingGeneralRepository {
  constructor() {
    super(api)
  }

  async fetchLandingGeneralData(): Promise<LandingGeneralData> {
    const res = await this.get<LandingGeneralResponse>(LANDING_ENDPOINTS.general)
    if (!res.success) throw res.error as ApiError
    return res.data
  }
}