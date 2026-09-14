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

/**
 * Alta por lote: una clase por curso del programa.
 *
 * ⚠️ Va contra `actions/bulk-store`, que SOLO AGREGA. El otro endpoint
 * parecido (`offers/actions/sessions/{offer}`) sincroniza y borra las clases
 * del horario que no vengan en el payload — no usarlo desde acá.
 */
export interface ClassSessionBulkBodyDTO {
  sessions: ClassSessionBodyDTO[];
}

/** Una fila omitida por el servidor, con el motivo para mostrarlo en pantalla. */
export interface ClassSessionBulkSkippedDTO {
  schedule_id: number;
  session_date: string;
  reason: string;
}

export interface ClassSessionBulkResultDTO {
  created: number;
  skipped: ClassSessionBulkSkippedDTO[];
}
