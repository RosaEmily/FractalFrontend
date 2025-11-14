import { BaseService } from './base.service'
import { api } from './api'
import { LANDING_ENDPOINTS } from './api.routes'
import type { LandingData, LandingResponse } from '@/types/landing'
import type { ILandingRepository } from '@/interfaces/landing.repository'

export class LandingService extends BaseService implements ILandingRepository {
  constructor() {
    super(api)
  }

  async fetchLanding(): Promise<LandingData[]> {
    //console.log('fetchLanding called in LandingService')
    const res = await this.get<LandingResponse>(LANDING_ENDPOINTS.base)
    //console.log('Respuesta del fetchLanding:', res)
    if (!res.success) throw new Error(res.error.message)
    return res.data
  }
}