import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type { CertificateDTO, CertificateBodyDTO } from "../dto/certificate.dto";

export interface Certificate {
  id: number;
  enrollmentCourseId: number;
  certificateTemplateId: number;
  code: string;
  issuedDate: string | null;
  status: number;
  updated_at: string;
}

export interface CertificateRepositoryTypes {
  base: RepositoryBase<Certificate, CertificateDTO>;
  create: { body: CertificateBodyDTO };
  update: { body: CertificateBodyDTO };
}
