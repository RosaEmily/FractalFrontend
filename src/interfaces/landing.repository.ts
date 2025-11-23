import type { LandingData } from '@/types/response/landing'

export interface ILandingRepository {
  fetchLanding(): Promise<LandingData>
}