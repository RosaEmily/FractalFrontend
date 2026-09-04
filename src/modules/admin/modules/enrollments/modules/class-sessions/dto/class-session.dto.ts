export interface ClassSessionDTO {
  id: number;
  /** Una clase cuelga de un horario, no del curso. */
  schedule_id: number | null;
  session_date: string;
  /** `HH:MM:SS`. Nullable: el horario semanal ya define el rango habitual. */
  start_time: string | null;
  end_time: string | null;
  name: string;
  topic: string | null;
  meet_link: string | null;
  /** Cadena hacia arriba del horario, la resuelve el Resource. */
  offer_id: number | null;
  offer_course_id: number | null;
  course_name: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface ClassSessionBodyDTO {
  /** Una clase cuelga de un horario, no del curso. */
  schedule_id: number | null;
  session_date: string | null;
  start_time: string | null;
  end_time: string | null;
  name: string | null;
  topic: string | null;
  meet_link: string | null;
}
