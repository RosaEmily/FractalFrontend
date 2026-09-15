import { BaseService } from "@/modules/admin/services/base.service";
import CertificateRepository from "../repositories/certificate.repository";
import type { CertificateRepositoryTypes } from "../models/certificate.model";
import type {
  CertificateBulkBodyDTO,
  CertificateBulkResultDTO,
} from "../dto/certificate.dto";

class CertificateService extends BaseService<
  typeof CertificateRepository,
  CertificateRepositoryTypes
> {
  constructor() {
    super(CertificateRepository);
  }

  /** Emisión por lote. Ver el repositorio: puede omitir alumnos y responder 200. */
  bulkIssue(body: CertificateBulkBodyDTO): Promise<CertificateBulkResultDTO> {
    return CertificateRepository.bulkIssue(body);
  }
}

export default new CertificateService();
