import type { Page } from "../models/page.model";
import type { PageDTO } from "../dto/page.dto";

export const pageAdapter = {
  one: (dto: PageDTO): Page => ({
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    content: dto.content,
    published: Boolean(dto.published),
  }),

  many: (dtos: PageDTO[]): Page[] => dtos.map((dto) => pageAdapter.one(dto)),
};
