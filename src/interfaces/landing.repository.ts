import type { LandingData } from '@/types/landing'

export interface ILandingRepository {
  fetchLanding(): Promise<LandingData[]>
}