import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { SocialNetworkRepositoryTypes } from "../models/social-network.model";
import { socialNetworkAdapter } from "../adapters/social-network.adapter";

class SocialNetworkRepository extends BaseRepository<SocialNetworkRepositoryTypes> {
  constructor() {
    super("landing/social_networks", socialNetworkAdapter);
  }
}

export default new SocialNetworkRepository();
