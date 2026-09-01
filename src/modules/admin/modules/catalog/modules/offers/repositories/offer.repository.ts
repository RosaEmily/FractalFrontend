import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { OfferRepositoryTypes } from "../models/offer.model";
import { OfferAdapter } from "../adapters/offer.adapter";

class OfferRepository extends BaseRepository<OfferRepositoryTypes> {
  constructor() {
    super("offers/offers", OfferAdapter);
  }
}

export default new OfferRepository();
