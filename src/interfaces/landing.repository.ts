import type { LandingGeneralData } from '@/types/response/general'

export interface ILandingRepository {
  fetchLanding(): Promise<LandingGeneralData>
}