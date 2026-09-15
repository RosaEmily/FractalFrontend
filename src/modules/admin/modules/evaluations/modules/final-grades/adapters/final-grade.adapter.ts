import dayjs from "dayjs";
import type { FinalGrade } from "../models/final-grade.model";
import type { FinalGradeDTO } from "../dto/final-grade.dto";

export const FinalGradeAdapter = {
  one: (dto: FinalGradeDTO): FinalGrade => ({
    id: dto.id,
    enrollmentCourseId: dto.enrollment_course_id,
    finalScore: dto.final_score !== null ? Number(dto.final_score) : null,
    approved: Boolean(dto.approved),
    calculatedAt: dto.calculated_at
      ? dayjs(dto.calculated_at).format("YYYY-MM-DD")
      : null,
    status: dto.status,
    updated_at: dto.updated_at,
  }),

  many: (dtos: FinalGradeDTO[]): FinalGrade[] =>
    dtos.map((dto) => FinalGradeAdapter.one(dto)),
};
