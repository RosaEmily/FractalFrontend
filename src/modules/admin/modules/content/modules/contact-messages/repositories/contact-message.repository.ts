import apiFractal from "@/shared/helpers/axios/api-fractal";
import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { ApiResponse } from "@/shared/interface/api-response";
import type { ContactMessageRepositoryTypes } from "../models/contact-message.model";
import { contactMessageAdapter } from "../adapters/contact-message.adapter";

const ROUTE = "landing/admin/contact-messages";

class ContactMessageRepository extends BaseRepository<ContactMessageRepositoryTypes> {
  constructor() {
    super(ROUTE, contactMessageAdapter);
  }

  /** Marca uno o varios mensajes como atendidos (1) o pendientes (0). */
  async attended(ids: (number | string)[], isAttended: 0 | 1): Promise<ApiResponse<null>> {
    return apiFractal.patch(`${ROUTE}/actions/attended`, {
      ids,
      is_attended: isAttended,
    });
  }
}

export default new ContactMessageRepository();
