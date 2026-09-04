export interface FinalGradeDTO {
  id: number;
  enrollment_course_id: number;
  final_score: string | number | null;
  approved: boolean | number;
  calculated_at: string | null;
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
