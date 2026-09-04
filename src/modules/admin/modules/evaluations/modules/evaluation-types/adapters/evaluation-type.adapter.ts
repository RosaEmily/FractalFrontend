import type { EvaluationType } from "../models/evaluation-type.model";
import type { EvaluationTypeDTO } from "../dto/evaluation-type.dto";

export const evaluationTypeAdapter = {
  one: (dto: EvaluationTypeDTO): EvaluationType => ({
    id: dto.id,
    name: dto.name,
    description: dto.description,
    status: dto.status,
    updated_at: dto.updated_at,
  }),

  many: (dtos: EvaluationTypeDTO[]): EvaluationType[] =>
    dtos.map((dto) => evaluationTypeAdapter.one(dto)),
};
