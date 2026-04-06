import type { LandingFooterData } from '@/types/response/footer'

export interface ILandingFooterRepository {
  fetchLandingFooterData(): Promise<LandingFooterData>
}