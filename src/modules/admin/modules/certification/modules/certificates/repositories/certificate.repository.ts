import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { CertificateRepositoryTypes } from "../models/certificate.model";
import { CertificateAdapter } from "../adapters/certificate.adapter";

class CertificateRepository extends BaseRepository<CertificateRepositoryTypes> {
  constructor() {
    super("certification/certificates", CertificateAdapter);
  }
}

export default new CertificateRepository();
