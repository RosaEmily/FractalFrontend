import dayjs from "dayjs";
import type { Certificate } from "../models/certificate.model";
import type { CertificateDTO } from "../dto/certificate.dto";

export const CertificateAdapter = {
  one: (dto: CertificateDTO): Certificate => ({
    id: dto.id,
    enrollmentCourseId: dto.enrollment_course_id,
    certificateTemplateId: dto.certificate_template_id,
    code: dto.code,
    issuedDate: dto.issued_date
      ? dayjs(dto.issued_date).format("YYYY-MM-DD")
      : null,
    status: dto.status,
    updated_at: dto.updated_at,
  }),

  many: (dtos: CertificateDTO[]): Certificate[] =>
    dtos.map((dto) => CertificateAdapter.one(dto)),
};
