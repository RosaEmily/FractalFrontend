import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { SponsorDTO, SponsorBodyDTO } from "../dto/sponsor.dto";

export interface Sponsor {
  id: string;
  name: string;
  image: string;
}

export interface SponsorRepositoryTypes {
  base: RepositoryBase<Sponsor, SponsorDTO>;
  create: { body: SponsorBodyDTO };
  update: { body: SponsorBodyDTO };
}
