import { BaseService } from "@/modules/admin/services/base.service";
import JobOfferRepository from "../repositories/job-offer.repository";
import type { JobOfferRepositoryTypes } from "../models/job-offer.model";

class JobOfferService extends BaseService<
  typeof JobOfferRepository,
  JobOfferRepositoryTypes
> {
  constructor() {
    super(JobOfferRepository);
  }
}

export default new JobOfferService();
