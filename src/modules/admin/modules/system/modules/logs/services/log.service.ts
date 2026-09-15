import { BaseService } from "@/modules/admin/services/base.service";
import LogRepository from "../repositories/log.repository";
import type { LogRepositoryTypes } from "../models/log.model";

class LogService extends BaseService<typeof LogRepository, LogRepositoryTypes> {
  constructor() {
    super(LogRepository);
  }
}

export default new LogService();
