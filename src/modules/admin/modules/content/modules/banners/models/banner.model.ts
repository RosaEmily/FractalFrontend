import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { BannerDTO, BannerBodyDTO } from "../dto/banner.dto";

export interface Banner {
  id: string;
  desktop: string;
  mobile: string;
  alt_desktop: string | null;
  alt_mobile: string | null;
}

export interface BannerRepositoryTypes {
  base: RepositoryBase<Banner, BannerDTO>;
  create: { body: BannerBodyDTO };
  update: { body: BannerBodyDTO };
}
