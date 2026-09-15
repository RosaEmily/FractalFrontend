import type { CourseEvaluation } from "../models/course-evaluation.model";
import type { CourseEvaluationDTO } from "../dto/course-evaluation.dto";

export const CourseEvaluationAdapter = {
  one: (dto: CourseEvaluationDTO): CourseEvaluation => ({
    id: dto.id,
    offerCourseId: dto.offer_course_id,
    evaluationTypeId: dto.evaluation_type_id,
    name: dto.name,
    weight: Number(dto.weight),
    maxScore: Number(dto.max_score),
    status: dto.status,
    updated_at: dto.updated_at,
  }),

  many: (dtos: CourseEvaluationDTO[]): CourseEvaluation[] =>
    dtos.map((dto) => CourseEvaluationAdapter.one(dto)),
};
