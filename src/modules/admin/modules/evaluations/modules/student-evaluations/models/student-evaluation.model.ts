import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type {
  StudentEvaluationDTO,
  StudentEvaluationBodyDTO,
} from "../dto/student-evaluation.dto";

export interface StudentEvaluation {
  id: number;
  enrollmentCourseId: number;
  courseEvaluationId: number;
  score: number | null;
  feedback: string | null;
  evaluatedAt: string | null;
  studentName: string | null;
  studentDocument: string | null;
  evaluationName: string | null;
  maxScore: number | null;
  courseName: string | null;
  offerName: string | null;
  status: number;
  updated_at: string;
}

export interface StudentEvaluationRepositoryTypes {
  base: RepositoryBase<StudentEvaluation, StudentEvaluationDTO>;
  create: { body: StudentEvaluationBodyDTO };
  update: { body: StudentEvaluationBodyDTO };
}
