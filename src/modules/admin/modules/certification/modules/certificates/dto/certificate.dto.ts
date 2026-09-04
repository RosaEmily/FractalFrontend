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

export interface CertificateBodyDTO {
  enrollment_course_id: number | null;
  certificate_template_id: number | null;
  code: string | null;
  issued_date: string | null;
}
