import { offerFiltersRepository } from "../repositories/offer-filters.repository";
import type { OfferFilters } from "../models/offer.model";

class OfferFiltersService {
  async get(): Promise<OfferFilters | null> {
    const resp = await offerFiltersRepository.get();
    return resp.data;
  }
}

export const offerFiltersService = new OfferFiltersService();
