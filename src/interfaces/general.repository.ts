import type { LandingGeneralData } from '@/types/response/general'

export interface ILandingGeneralRepository {
  fetchLandingGeneralData(): Promise<LandingGeneralData>
}