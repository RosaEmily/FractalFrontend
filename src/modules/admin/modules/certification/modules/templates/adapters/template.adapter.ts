import type { CertificateTemplate } from "../models/template.model";
import type { CertificateTemplateDTO } from "../dto/template.dto";

export const CertificateTemplateAdapter = {
  one: (dto: CertificateTemplateDTO): CertificateTemplate => ({
    id: dto.id,
    name: dto.name,
    backgroundImage: dto.background_image,
    fontFamily: dto.font_family,
    signatureImage: dto.signature_image,
    status: dto.status,
    updated_at: dto.updated_at,
  }),

  many: (dtos: CertificateTemplateDTO[]): CertificateTemplate[] =>
    dtos.map((dto) => CertificateTemplateAdapter.one(dto)),
};
