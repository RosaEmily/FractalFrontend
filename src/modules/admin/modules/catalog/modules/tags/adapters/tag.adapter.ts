import type { Tag } from "../models/tag.model";
import type { TagDTO } from "../dto/tag.dto";

export const TagAdapter = {
  one: (dto: TagDTO): Tag => ({
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    coursesCount: dto.courses_count ?? 0,
    status: dto.status,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
  }),

  many: (dtos: TagDTO[]): Tag[] => dtos.map((dto) => TagAdapter.one(dto)),
};
