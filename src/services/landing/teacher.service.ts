import { BaseService } from '../base.service'
import { api } from '../api'
import { LANDING_ENDPOINTS } from '../api.routes'
import type { LandingTeacherData, LandingTeacherResponse } from '@/types/response/teacher'
import type { ILandingTeacherRepository } from '@/interfaces/teacher.repository'
import type { ApiError } from '@/types/response/api'

export class LandingTeacherService extends BaseService implements ILandingTeacherRepository {
  constructor() {
    super(api)
  }

  async fetchLandingTeacherData(): Promise<LandingTeacherData> {
    const res = await this.get<LandingTeacherResponse>(LANDING_ENDPOINTS.teachers)
    if (!res.success) throw res.error as ApiError
    return res.data
  }
}