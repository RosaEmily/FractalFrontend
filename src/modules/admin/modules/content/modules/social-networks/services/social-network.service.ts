import { BaseService } from "@/modules/admin/services/base.service";
import SocialNetworkRepository from "../repositories/social-network.repository";
import type { SocialNetworkRepositoryTypes } from "../models/social-network.model";

class SocialNetworkService extends BaseService<
  typeof SocialNetworkRepository,
  SocialNetworkRepositoryTypes
> {
  constructor() {
    super(SocialNetworkRepository);
  }
}

export default new SocialNetworkService();
