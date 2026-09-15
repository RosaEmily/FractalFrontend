import { offerRepository } from "../repositories/offer.repository";
import type { Offer, OfferList } from "../models/offer.model";

class OfferService {
  async list(params?: Record<string, string>): Promise<OfferList | null> {
    const resp = await offerRepository.list(params);
    return resp.data;
  }

  async get(id: number): Promise<Offer | null> {
    const resp = await offerRepository.get(id);
    return resp.data;
  }
}

export const offerService = new OfferService();
