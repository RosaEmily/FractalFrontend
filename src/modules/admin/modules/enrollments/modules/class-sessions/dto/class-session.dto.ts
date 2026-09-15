export interface ClassSessionDTO {
  id: number;
  session_date: string;
  name: string;
  topic: string | null;
  meet_link: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface ClassSessionBodyDTO {
  /** Una clase cuelga de un horario, no del curso. */
  schedule_id: number | null;
  session_date: string | null;
  name: string | null;
  topic: string | null;
  meet_link: string | null;
}
