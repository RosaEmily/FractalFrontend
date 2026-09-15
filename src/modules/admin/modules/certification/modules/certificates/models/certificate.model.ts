import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type {
  CertificateDTO,
  CertificateBodyDTO,
  CertificateSubjectType,
} from "../dto/certificate.dto";

export interface Certificate {
  id: number;
  enrollmentCourseId: number | null;
  enrollmentItemId: number | null;
  certificateTemplateId: number;
  code: string;
  issuedDate: string | null;
  /** Formateada para mostrar (`DD/MM/YYYY`). */
  issuedDateLabel: string;
  studentName: string | null;
  studentDocument: string | null;
  /** Curso certificado, o línea de carrera si es un diploma. */
  subjectName: string | null;
  subjectType: CertificateSubjectType;
  /** "Certificado" / "Diploma", ya resuelto para la UI. */
  subjectTypeLabel: string;
  templateName: string | null;
  status: number;
  updated_at: string;
}

export interface CertificateRepositoryTypes {
  base: RepositoryBase<Certificate, CertificateDTO>;
  create: { body: CertificateBodyDTO };
  update: { body: CertificateBodyDTO };
}
