import type { LandingFooterData } from '@/types/response/footer'
import type { ILandingFooterRepository } from '@/interfaces/footer.repository'
import footerConfig from '@/assets/config/footer.json'

export class LandingFooterService implements ILandingFooterRepository {

  async fetchLandingFooterData(): Promise<LandingFooterData> {
    return footerConfig as LandingFooterData
  }
}