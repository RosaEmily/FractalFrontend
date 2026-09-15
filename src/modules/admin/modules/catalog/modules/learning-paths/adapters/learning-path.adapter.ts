import type {
  LearningPath,
  LearningPathCourseItem,
} from "../models/learning-path.model";
import type { LearningPathDTO } from "../dto/learning-path.dto";

export const LearningPathAdapter = {
  one: (dto: LearningPathDTO): LearningPath => {
    const courseItems: LearningPathCourseItem[] = (dto.course_items ?? []).map(
      (item) => ({
        courseId: item.course_id,
        name: item.name,
        order: item.order,
      }),
    );

    return {
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
      courses: dto.courses ?? [],
      courseItems,
      courseIds: courseItems.map((item) => item.courseId),
    };
  },

  many: (dtos: LearningPathDTO[]): LearningPath[] =>
    dtos.map((dto) => LearningPathAdapter.one(dto)),
};
