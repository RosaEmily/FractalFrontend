export interface StudentEvaluationDTO {
  id: number;
  enrollment_course_id: number;
  course_evaluation_id: number;
  score: string | number | null;
  feedback: string | null;
  evaluated_at: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface StudentEvaluationBodyDTO {
  enrollment_course_id: number | null;
  course_evaluation_id: number | null;
  score: number | null;
  feedback: string | null;
  evaluated_at: string | null;
}
