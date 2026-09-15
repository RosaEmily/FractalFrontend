import type { RepositoryBase } from "@/modules/admin/interface/base-repository";
import type {
  CertificateTemplateDTO,
  CertificateTemplateBodyDTO,
} from "../dto/template.dto";

export interface CertificateTemplate {
  id: number;
  name: string;
  backgroundImage: string | null;
  fontFamily: string | null;
  signatureImage: string | null;
  status: number;
  updated_at: string;
}

export interface CertificateTemplateRepositoryTypes {
  base: RepositoryBase<CertificateTemplate, CertificateTemplateDTO>;
  create: { body: CertificateTemplateBodyDTO };
  update: { body: CertificateTemplateBodyDTO };
}
