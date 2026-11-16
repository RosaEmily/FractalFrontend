import type { LearningPathDTO } from "../dto/learning-path.dto";
import type { LearningPath } from "../models/learning-path.model";

export const LearningPathAdapter = {
  one: (dto: LearningPathDTO): LearningPath => ({
    id: dto.id,
    name: dto.name,
    description: dto.description ?? "",
    imageUrl: dto.image_url,
    offersCount: Number(dto.offers_count),
  }),

  many: (dtos: LearningPathDTO[]): LearningPath[] =>
    dtos.map((dto) => LearningPathAdapter.one(dto)),
};
