export interface StudentEvaluationDTO {
  id: number;
  enrollment_course_id: number;
  course_evaluation_id: number;
  score: string | number | null;
  feedback: string | null;
  evaluated_at: string | null;
  /** Resueltos por el Resource: sin esto la nota no tenía sujeto. */
  student_name: string | null;
  student_document: string | null;
  evaluation_name: string | null;
  max_score: string | number | null;
  course_name: string | null;
  offer_name: string | null;
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

/**
 * Alta masiva de notas: upsert por `(enrollment_course_id, course_evaluation_id)`.
 *
 * ⚠️ `score` viaja nullable a propósito: una celda vacía guarda `null` (no tiene
 * nota), mientras que un 0 significa que el alumno rindió y sacó cero.
 */
export type StudentEvaluationBulkBodyDTO = StudentEvaluationBodyDTO[];
