import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type {
  SocialNetworkDTO,
  SocialNetworkBodyDTO,
} from "../dto/social-network.dto";

export interface SocialNetwork {
  id: string;
  name: string;
  url: string;
  /** Path del icono mdi según la plataforma. */
  icon: string;
}

export interface SocialNetworkRepositoryTypes {
  base: RepositoryBase<SocialNetwork, SocialNetworkDTO>;
  create: { body: SocialNetworkBodyDTO };
  update: { body: SocialNetworkBodyDTO };
}
