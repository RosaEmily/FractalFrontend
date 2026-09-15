/** Contratos crudos del docente. Espejo fiel de la API: snake_case y decimales string. */

export interface TeacherCourseDTO {
  /** `offer_courses.id` — el curso dictado en una cohorte concreta. */
  id: number;
  start_date: string | null;
  end_date: string | null;
  meet_link: string | null;
  course_id: number;
  course_name: string;
  offer_id: number;
  offer_name: string;
  offer_prefix: string | null;
  offer_type: string;
  students_count: number;
  sessions_total: number;
  sessions_done: number;
  sessions_percent: number;
  weight_total: string | number;
  weights_ok: boolean;
  /** `not_started | in_progress | completed | overdue`, derivado en el backend. */
  state: string;
}

export interface TeacherSessionDTO {
  id: number;
  schedule_id: number | null;
  session_date: string;
  start_time: string | null;
  end_time: string | null;
  name: string | null;
  topic: string | null;
  meet_link: string | null;
  status: number;
  offer_course_id: number;
  course_name: string;
  offer_name: string;
  offer_prefix: string | null;
  /** Cuántos alumnos ya tienen marca en esta clase. */
  marked_count: number;
  /** `closed | partial | pending`. */
  attendance_state: string;
}

export interface RosterStudentDTO {
  enrollment_course_id: number;
  document_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  photo_url: string | null;
  career: string | null;
  attendance_id: number | null;
  attended: number | null;
  attended_name: string | null;
  attended_at: string | null;
}

export interface RosterDTO {
  class_session_id: number;
  students: RosterStudentDTO[];
  summary: { present: number; late: number; absent: number };
}

export interface CourseEvaluationDTO {
  id: number;
  name: string;
  weight: string | number;
  max_score: string | number;
  evaluation_type_id: number | null;
  evaluation_type_name: string | null;
  /** Cuántas notas ya tiene: con al menos una, la evaluación queda bloqueada. */
  graded_count: number;
}

export interface EvaluationsDTO {
  evaluations: CourseEvaluationDTO[];
  totals: { weight_total: number; weights_ok: boolean };
}

export interface GradebookScoreDTO {
  course_evaluation_id: number;
  student_evaluation_id: number | null;
  score: number | null;
  feedback: string | null;
  evaluated_at: string | null;
  weight: number;
}

export interface GradebookStudentDTO {
  enrollment_course_id: number;
  document_number: string;
  full_name: string;
  scores: GradebookScoreDTO[];
  accumulated: number;
  evaluated_weight: number;
}

export interface GradebookDTO {
  evaluations: CourseEvaluationDTO[];
  students: GradebookStudentDTO[];
  totals: { weight_total: number; weights_ok: boolean; students: number };
}

export interface FinalsStudentDTO {
  enrollment_course_id: number;
  document_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  final_grade_id: number | null;
  final_score: string | number | null;
  approved: boolean | null;
  calculated_at: string | null;
  closed_by: number | null;
  closed_at: string | null;
  certificate_id: number | null;
  certificate_code: string | null;
}

export interface FinalsDTO {
  students: FinalsStudentDTO[];
  closed_at: string | null;
  is_closed: boolean;
  /** Lo que falta para poder cerrar el acta. Lo valida el backend, no la vista. */
  requirements: {
    has_evaluations: boolean;
    has_students: boolean;
    weights_ok: boolean;
    all_graded: boolean;
    all_sessions_done: boolean;
    missing_scores: number;
    pending_sessions: number;
  };
  can_close: boolean;
  totals: {
    students: number;
    with_grade: number;
    approved: number;
    passing_score: number;
  };
}
