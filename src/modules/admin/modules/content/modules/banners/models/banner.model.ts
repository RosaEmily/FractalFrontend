import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { BannerDTO, BannerBodyDTO } from "../dto/banner.dto";

export interface BannerMeta {
  inicia: string | null;
  duracion: string | null;
  cupos: string | null;
  precio: string | null;
  offerName: string | null;
  offerEnrollmentStartDate: string | null;
  offerEnrollmentEndDate: string | null;
}

export interface Banner {
  id: string;
  desktop: string;
  mobile: string;
  alt_desktop: string | null;
  alt_mobile: string | null;
  tag: string | null;
  kicker: string | null;
  title: string | null;
  sub: string | null;
  cta: string | null;
  cta2: string | null;
  dark: boolean;
  order: number | null;
  offerId: number | null;
  meta: BannerMeta | null;
}

export interface BannerRepositoryTypes {
  base: RepositoryBase<Banner, BannerDTO>;
  create: { body: BannerBodyDTO };
  update: { body: BannerBodyDTO };
}
