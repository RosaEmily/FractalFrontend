import { BaseService } from "@/modules/admin/services/base.service";
import BannerRepository from "../repositories/banner.repository";
import type { BannerRepositoryTypes } from "../models/banner.model";

class BannerService extends BaseService<
  typeof BannerRepository,
  BannerRepositoryTypes
> {
  constructor() {
    super(BannerRepository);
  }
}

export default new BannerService();
