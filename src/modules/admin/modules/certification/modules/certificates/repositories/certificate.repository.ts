import apiFractal from "@/shared/helpers/axios/api-fractal";
import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { CertificateRepositoryTypes } from "../models/certificate.model";
import { CertificateAdapter } from "../adapters/certificate.adapter";
import type {
  CertificateBulkBodyDTO,
  CertificateBulkResultDTO,
} from "../dto/certificate.dto";
import type { ApiResponse } from "@/shared/interface/api-response";

class CertificateRepository extends BaseRepository<CertificateRepositoryTypes> {
  constructor() {
    super("certification/certificates", CertificateAdapter);
  }

  /**
   * Emisión por lote. Devuelve cuántos se emitieron y a quiénes se omitió.
   *
   * ⚠️ Responde 200 aunque omita alumnos (ya certificado / sin aprobar): en un
   * lote eso es normal y abortar obligaría a destildarlos a mano.
   */
  async bulkIssue(
    body: CertificateBulkBodyDTO,
  ): Promise<CertificateBulkResultDTO> {
    const response = await apiFractal.post<
      ApiResponse<CertificateBulkResultDTO>
    >(`${this.route}/actions/bulk-issue`, body);

    return response.data?.data ?? { issued: 0, skipped: [], codes: [] };
  }
}

export default new CertificateRepository();
