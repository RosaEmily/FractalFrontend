import apiFractal from "@/shared/helpers/axios/api-fractal";
import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { ApiResponse } from "@/shared/interface/api-response";
import type { ComplaintRepositoryTypes } from "../models/complaint.model";
import type { ComplaintRespondBodyDTO } from "../dto/complaint.dto";
import { complaintAdapter } from "../adapters/complaint.adapter";

const ROUTE = "landing/admin/complaints";

class ComplaintRepository extends BaseRepository<ComplaintRepositoryTypes> {
  constructor() {
    super(ROUTE, complaintAdapter);
  }

  /** Pasa la hoja a "en proceso" o la responde (y la API envía la respuesta por correo). */
  async respond(id: number | string, body: ComplaintRespondBodyDTO): Promise<ApiResponse<null>> {
    return apiFractal.put(`${ROUTE}/${id}/respond`, body);
  }
}

export default new ComplaintRepository();
