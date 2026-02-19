import type { LandingData } from '@/types/response/general'

export interface ILandingRepository {
  fetchLanding(): Promise<LandingData>
}