/** `course` = certificado de un curso · `learning_path` = diploma de línea. */
export type CertificateSubjectType = "course" | "learning_path";

export interface CertificateDTO {
  id: number;
  /** Un certificado cuelga de UNO de los dos, nunca de ambos. */
  enrollment_course_id: number | null;
  enrollment_item_id: number | null;
  certificate_template_id: number;
  code: string;
  issued_date: string | null;
  /** Resueltos por el Resource: el listado necesita saber de quién y de qué es. */
  student_name: string | null;
  student_document: string | null;
  subject_name: string | null;
  subject_type: CertificateSubjectType;
  template_name: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

/**
 * ⚠️ Sin `code`: lo genera el SERVIDOR con una secuencia continua
 * (`FRAC-{año}-{#####}`) y es de solo lectura. Mandarlo no hace nada — el
 * Request de la API lo descarta.
 */
export interface CertificateBodyDTO {
  enrollment_course_id: number | null;
  certificate_template_id: number | null;
  issued_date: string | null;
}

/** Un curso de la emisión masiva: plantilla y fecha propias por curso. */
export interface CertificateBulkItemDTO {
  certificate_template_id: number;
  issued_date: string | null;
  enrollment_course_ids: number[];
}

export interface CertificateBulkBodyDTO {
  items: CertificateBulkItemDTO[];
}

/** Motivo por el que un alumno quedó fuera del lote. */
export interface CertificateBulkSkippedDTO {
  enrollment_course_id: number;
  reason: string;
}

export interface CertificateBulkResultDTO {
  issued: number;
  skipped: CertificateBulkSkippedDTO[];
  codes: string[];
}
