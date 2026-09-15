export interface CourseEvaluationDTO {
  id: number;
  offer_course_id: number;
  evaluation_type_id: number;
  name: string;
  weight: string | number;
  max_score: string | number;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface CourseEvaluationBodyDTO {
  offer_course_id: number | null;
  evaluation_type_id: number | null;
  name: string | null;
  weight: number | null;
  max_score: number | null;
}
