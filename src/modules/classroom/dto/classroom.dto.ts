/**
 * Contratos crudos del dominio `Classroom` de la API.
 *
 * Los nombres y tipos son los que devuelve el backend, tal cual: snake_case y
 * decimales como string (MySQL los serializa así). El adapter se encarga de
 * normalizarlos — acá no se corrige nada, para que el DTO siga siendo un
 * espejo fiel del endpoint.
 */

export interface ScheduleDTO {
  id: number;
  day_of_week: string;
  start_time: string | null;
  end_time: string | null;
  enrollment_course_id: number;
  course_name: string;
}

export interface SessionDTO {
  id: number;
  schedule_id: number | null;
  enrollment_course_id: number | null;
  session_date: string;
  start_time: string | null;
  end_time: string | null;
  day_of_week: string | null;
  name: string | null;
  topic: string | null;
  meet_link: string | null;
  status: number;
  is_done: boolean;
  /** 0 ausente · 1 presente · 2 tardanza. Null = el docente no marcó. */
  attended: number | null;
  attended_name: string | null;
  attended_at: string | null;
  course_name: string | null;
  offer_name: string | null;
  offer_prefix: string | null;
}

export interface EvaluationDTO {
  id: number;
  student_evaluation_id: number | null;
  name: string;
  weight: number;
  max_score: number;
  evaluation_type_id: number | null;
  evaluation_type_name: string | null;
  score: number | null;
  feedback: string | null;
  evaluated_at: string | null;
  /** Puntos sobre 20 que aporta: `score × weight / 100`. Lo calcula la API. */
  contribution: number | null;
}

export interface FinalGradeDTO {
  final_score: number | null;
  approved: boolean;
  calculated_at: string | null;
}

export interface CertificateRefDTO {
  id: number;
  code: string;
  issued_date: string | null;
  template_name: string | null;
}

export interface NotificationDTO {
  type: string;
  /** Tabla e id que dispararon el aviso: con eso se marca como leído. */
  entity_type: string;
  entity_id: number;
  title: string;
  body: string | null;
  at: string | null;
  tone: string;
  read: boolean;
  /** A dónde lleva. `id` solo viene cuando la ruta lo necesita. */
  route: { name: string; id?: number };
}

export interface NotificationsDTO {
  items: NotificationDTO[];
  unread: number;
}

export interface MaterialDTO {
  id: number;
  class_session_id: number;
  name: string;
  url: string;
  type: string;
  mime_type: string | null;
  size: number | null;
  /** Null = visible ya. Con fecha, solo a partir de ella. */
  visible_from: string | null;
  created_at: string;
  session_date?: string;
  session_name?: string | null;
  type_label: string;
  uploader_name: string | null;
  is_visible: boolean;
}

export interface StudentCourseDTO {
  /** `enrollment_courses.id`: la clave que exigen notas, asistencias y certificados. */
  id: number;
  progress_status: string;
  enrollment_id: number;
  offer_course_id: number;
  start_date: string | null;
  end_date: string | null;
  meet_link: string | null;
  teacher_id: string | null;
  teacher_name: string | null;
  teacher_specialty: string | null;
  course_id: number;
  course_name: string;
  course_description: string | null;
  course_image_url: string | null;
  /** Nota aprobatoria: la de la cohorte manda sobre la del curso. */
  offer_passing_score: string | null;
  course_passing_score: string | null;
  offer_id: number;
  offer_name: string;
  offer_prefix: string | null;
  offer_type: string;
  learning_path_id: number | null;
  schedules: ScheduleDTO[];
  sessions_total: number;
  sessions_done: number;
  sessions_percent: number;
  weight_total: number;
  evaluated_weight: number;
  weight_percent: number;
  accumulated: number;
  /** Nota proyectada sobre el peso ya evaluado. Null si nada calificado. */
  equivalent_score: number | null;
  weights_ok: boolean;
  /** Null sin marcas: un 0% se leería como "faltó a todo". */
  attendance_percent: number | null;
  attendance_present: number;
  attendance_late: number;
  attendance_absent: number;
  final_grade: FinalGradeDTO | null;
  certificate: CertificateRefDTO | null;
  next_session: SessionDTO | null;
  state: string;
  /** Solo en el detalle. */
  sessions?: SessionDTO[];
  evaluations?: EvaluationDTO[];
  materials?: MaterialDTO[];
}

export interface StudentCertificateDTO {
  id: number;
  enrollment_course_id: number;
  code: string;
  issued_date: string | null;
  template_name: string | null;
  course_name: string;
  offer_name: string;
  offer_prefix: string | null;
}
