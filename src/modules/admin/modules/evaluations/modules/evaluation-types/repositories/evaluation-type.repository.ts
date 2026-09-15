import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { EvaluationTypeRepositoryTypes } from "../models/evaluation-type.model";
import { evaluationTypeAdapter } from "../adapters/evaluation-type.adapter";

class EvaluationTypeRepository extends BaseRepository<EvaluationTypeRepositoryTypes> {
  constructor() {
    super("evaluations/types", evaluationTypeAdapter);
  }
}

export default new EvaluationTypeRepository();
