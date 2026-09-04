import type { Sponsor } from "../models/sponsor.model";
import type { SponsorDTO } from "../dto/sponsor.dto";

export const sponsorAdapter = {
  one: (dto: SponsorDTO): Sponsor => ({
    id: dto.id,
    name: dto.name,
    image: dto.image,
  }),

  many: (dtos: SponsorDTO[]): Sponsor[] =>
    dtos.map((dto) => sponsorAdapter.one(dto)),
};
