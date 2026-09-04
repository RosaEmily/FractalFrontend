import { BaseService } from "@/modules/admin/services/base.service";
import SponsorRepository from "../repositories/sponsor.repository";
import type { SponsorRepositoryTypes } from "../models/sponsor.model";

class SponsorService extends BaseService<
  typeof SponsorRepository,
  SponsorRepositoryTypes
> {
  constructor() {
    super(SponsorRepository);
  }
}

export default new SponsorService();
