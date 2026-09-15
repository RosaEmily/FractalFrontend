import dayjs from "dayjs";
import type { StudentEvaluation } from "../models/student-evaluation.model";
import type { StudentEvaluationDTO } from "../dto/student-evaluation.dto";

export const StudentEvaluationAdapter = {
  one: (dto: StudentEvaluationDTO): StudentEvaluation => ({
    id: dto.id,
    enrollmentCourseId: dto.enrollment_course_id,
    courseEvaluationId: dto.course_evaluation_id,
    score: dto.score !== null ? Number(dto.score) : null,
    feedback: dto.feedback,
    evaluatedAt: dto.evaluated_at
      ? dayjs(dto.evaluated_at).format("YYYY-MM-DD")
      : null,
    status: dto.status,
    updated_at: dto.updated_at,
  }),

  many: (dtos: StudentEvaluationDTO[]): StudentEvaluation[] =>
    dtos.map((dto) => StudentEvaluationAdapter.one(dto)),
};
