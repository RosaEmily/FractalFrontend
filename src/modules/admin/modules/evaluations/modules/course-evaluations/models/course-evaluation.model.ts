import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type {
  CourseEvaluationDTO,
  CourseEvaluationBodyDTO,
} from "../dto/course-evaluation.dto";

export interface CourseEvaluation {
  id: number;
  offerCourseId: number;
  evaluationTypeId: number;
  name: string;
  weight: number;
  maxScore: number;
  courseName: string | null;
  offerName: string | null;
  evaluationTypeName: string | null;
  status: number;
  updated_at: string;
}

export interface CourseEvaluationRepositoryTypes {
  base: RepositoryBase<CourseEvaluation, CourseEvaluationDTO>;
  create: { body: CourseEvaluationBodyDTO };
  update: { body: CourseEvaluationBodyDTO };
}
