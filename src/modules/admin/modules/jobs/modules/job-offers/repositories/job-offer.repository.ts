import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { JobOfferRepositoryTypes } from "../models/job-offer.model";
import { JobOfferAdapter } from "../adapters/job-offer.adapter";

class JobOfferRepository extends BaseRepository<JobOfferRepositoryTypes> {
  constructor() {
    super("support/job-offers", JobOfferAdapter);
  }
}

export default new JobOfferRepository();
