import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { LogRepositoryTypes } from "../models/log.model";
import { LogAdapter, LogDetailAdapter } from "../adapters/log.adapter";

/** Solo lectura: los escriben el middleware de actividad y el handler. */
class LogRepository extends BaseRepository<LogRepositoryTypes> {
  constructor() {
    // `edit` lleva su propio adapter: `show` devuelve el stack y el contexto,
    // que el listado omite a propósito.
    super("support/logs", LogAdapter, { edit: LogDetailAdapter });
  }
}

export default new LogRepository();
