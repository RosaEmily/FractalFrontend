export interface CertificateDTO {
  id: number;
  enrollment_course_id: number;
  certificate_template_id: number;
  code: string;
  issued_date: string | null;
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
