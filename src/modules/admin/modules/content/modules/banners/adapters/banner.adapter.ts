import type { Banner } from "../models/banner.model";
import type { BannerDTO } from "../dto/banner.dto";

export const bannerAdapter = {
  one: (dto: BannerDTO): Banner => ({
    id: dto.id,
    desktop: dto.desktop,
    mobile: dto.mobile,
    alt_desktop: dto.alt_desktop,
    alt_mobile: dto.alt_mobile,
  }),

  many: (dtos: BannerDTO[]): Banner[] =>
    dtos.map((dto) => bannerAdapter.one(dto)),
};
