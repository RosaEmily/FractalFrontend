import apiFractal from "@/shared/helpers/axios/api-fractal";
import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { ApiResponse } from "@/shared/interface/api-response";
import type { SystemSessionRepositoryTypes } from "../models/session.model";
import { SystemSessionAdapter } from "../adapters/session.adapter";

/**
 * Sesiones de TODOS los usuarios. Va bajo `system/`, no `auth/`, porque
 * `auth/sessions` significa "mis sesiones".
 */
class SystemSessionRepository extends BaseRepository<SystemSessionRepositoryTypes> {
  constructor() {
    super("system/sessions", SystemSessionAdapter);
  }

  /** La API no expone bulk-delete: se revoca de a una. */
  async revoke(id: number | string): Promise<ApiResponse<null>> {
    return await apiFractal.delete(`${this.route}/${id}`);
  }
}

export default new SystemSessionRepository();
