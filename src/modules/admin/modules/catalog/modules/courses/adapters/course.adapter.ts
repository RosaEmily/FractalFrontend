import type { Course } from "../models/course.model";
import type { CourseDTO } from "../dto/course.dto";

export const CourseAdapter = {
  one: (dto: CourseDTO): Course => ({
    id: dto.id,
    name: dto.name,
    description: dto.description,
    price: dto.price,
    priceRaw: dto.price_raw !== null ? Number(dto.price_raw) : null,
    currencyId: dto.currency_id,
    imageUrl: dto.image_url,
    status: dto.status,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
    tags: dto.tags ?? [],
    tagIds: dto.tag_ids ?? [],
  }),

  many: (dtos: CourseDTO[]): Course[] =>
    dtos.map((dto) => CourseAdapter.one(dto)),
};
