export interface FinalGradeDTO {
  id: number;
  enrollment_course_id: number;
  final_score: string | number | null;
  approved: boolean | number;
  calculated_at: string | null;
  /** Resueltos por el Resource: sin esto la nota final no tenía sujeto. */
  student_name: string | null;
  student_document: string | null;
  course_name: string | null;
  offer_name: string | null;
  closed_at: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface FinalGradeBodyDTO {
  enrollment_course_id: number | null;
  final_score: number | null;
  approved: boolean;
  calculated_at: string | null;
}
