import { BaseService } from "@/modules/admin/services/base.service";
import CertificateTemplateRepository from "../repositories/template.repository";
import type { CertificateTemplateRepositoryTypes } from "../models/template.model";

class CertificateTemplateService extends BaseService<
  typeof CertificateTemplateRepository,
  CertificateTemplateRepositoryTypes
> {
  constructor() {
    super(CertificateTemplateRepository);
  }
}

export default new CertificateTemplateService();
