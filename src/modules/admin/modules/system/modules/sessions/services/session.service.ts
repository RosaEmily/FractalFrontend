import { BaseService } from "@/modules/admin/services/base.service";
import SystemSessionRepository from "../repositories/session.repository";
import type { SystemSessionRepositoryTypes } from "../models/session.model";

class SystemSessionService extends BaseService<
  typeof SystemSessionRepository,
  SystemSessionRepositoryTypes
> {
  constructor() {
    super(SystemSessionRepository);
  }

  async revoke(id: number | string): Promise<null> {
    const resp = await SystemSessionRepository.revoke(id);
    return resp.data;
  }
}

export default new SystemSessionService();
