export interface CourseEvaluationDTO {
  id: number;
  offer_course_id: number;
  evaluation_type_id: number;
  name: string;
  weight: string | number;
  max_score: string | number;
  /** Resueltos por el Resource: el listado necesita el contexto de la fila. */
  course_name: string | null;
  offer_name: string | null;
  evaluation_type_name: string | null;
  /** Quién dicta ese curso en esa cohorte. El docente va en el offer_course. */
  teacher_name: string | null;
  /** `course` = curso suelto · `learning_path` = línea de carrera. */
  offer_type: "course" | "learning_path" | null;
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

/**
 * Alta masiva: el cuadro de evaluación de varios cursos a la vez.
 *
 * ⚠️ `bulk-sync` es un UPSERT por `(offer_course_id, name)`: no borra lo que no
 * viene. Y el servidor exige que los pesos de cada curso sumen 100, así que hay
 * que mandar el cuadro COMPLETO del curso, no solo las filas nuevas.
 */
export type CourseEvaluationBulkBodyDTO = Required<CourseEvaluationBodyDTO>[];
