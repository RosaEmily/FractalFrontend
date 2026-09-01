import { BaseService } from "@/modules/admin/services/base.service";
import EvaluationTypeRepository from "../repositories/evaluation-type.repository";
import type { EvaluationTypeRepositoryTypes } from "../models/evaluation-type.model";

class EvaluationTypeService extends BaseService<
  typeof EvaluationTypeRepository,
  EvaluationTypeRepositoryTypes
> {
  constructor() {
    super(EvaluationTypeRepository);
  }
}

export default new EvaluationTypeService();
