import dayjs from "dayjs";
import type { Certificate } from "../models/certificate.model";
import type { CertificateDTO } from "../dto/certificate.dto";

/** Un diploma acredita una línea de carrera; un certificado, un curso. */
const SUBJECT_TYPE_LABEL: Record<string, string> = {
  course: "Certificado",
  learning_path: "Diploma",
};

export const CertificateAdapter = {
  one: (dto: CertificateDTO): Certificate => ({
    id: dto.id,
    enrollmentCourseId: dto.enrollment_course_id ?? null,
    enrollmentItemId: dto.enrollment_item_id ?? null,
    certificateTemplateId: dto.certificate_template_id,
    code: dto.code,
    // Cruda para el formulario de edición; el listado usa `issuedDateLabel`.
    issuedDate: dto.issued_date
      ? dayjs(dto.issued_date).format("YYYY-MM-DD")
      : null,
    issuedDateLabel: dto.issued_date
      ? dayjs(dto.issued_date).format("DD/MM/YYYY")
      : "—",
    studentName: dto.student_name ?? null,
    studentDocument: dto.student_document ?? null,
    subjectName: dto.subject_name ?? null,
    subjectType: dto.subject_type,
    subjectTypeLabel: SUBJECT_TYPE_LABEL[dto.subject_type] ?? "Certificado",
    templateName: dto.template_name ?? null,
    status: dto.status,
    updated_at: dto.updated_at,
  }),

  many: (dtos: CertificateDTO[]): Certificate[] =>
    dtos.map((dto) => CertificateAdapter.one(dto)),
};
