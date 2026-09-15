import { BaseService } from "@/modules/admin/services/base.service";
import ClassSessionRepository from "../repositories/class-session.repository";
import type { ClassSessionRepositoryTypes } from "../models/class-session.model";
import type {
  ClassSessionBulkBodyDTO,
  ClassSessionBulkResultDTO,
} from "../dto/class-session.dto";

class ClassSessionService extends BaseService<
  typeof ClassSessionRepository,
  ClassSessionRepositoryTypes
> {
  constructor() {
    super(ClassSessionRepository);
  }

  /** Alta por lote. Ver el repositorio: puede omitir filas y responder 200. */
  bulkStore(
    body: ClassSessionBulkBodyDTO,
  ): Promise<ClassSessionBulkResultDTO> {
    return ClassSessionRepository.bulkStore(body);
  }
}

export default new ClassSessionService();
