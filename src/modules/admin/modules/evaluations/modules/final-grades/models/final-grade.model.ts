import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { FinalGradeDTO, FinalGradeBodyDTO } from "../dto/final-grade.dto";

export interface FinalGrade {
  id: number;
  enrollmentCourseId: number;
  finalScore: number | null;
  approved: boolean;
  calculatedAt: string | null;
  status: number;
  updated_at: string;
}

export interface FinalGradeRepositoryTypes {
  base: RepositoryBase<FinalGrade, FinalGradeDTO>;
  create: { body: FinalGradeBodyDTO };
  update: { body: FinalGradeBodyDTO };
}
