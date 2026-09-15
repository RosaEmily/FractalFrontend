import { BaseService } from "@/modules/admin/services/base.service";
import CertificateRepository from "../repositories/certificate.repository";
import type { CertificateRepositoryTypes } from "../models/certificate.model";

class CertificateService extends BaseService<
  typeof CertificateRepository,
  CertificateRepositoryTypes
> {
  constructor() {
    super(CertificateRepository);
  }
}

export default new CertificateService();
