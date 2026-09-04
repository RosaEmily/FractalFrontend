import { BaseService } from "@/modules/admin/services/base.service";
import FinalGradeRepository from "../repositories/final-grade.repository";
import type { FinalGradeRepositoryTypes } from "../models/final-grade.model";

class FinalGradeService extends BaseService<
  typeof FinalGradeRepository,
  FinalGradeRepositoryTypes
> {
  constructor() {
    super(FinalGradeRepository);
  }
}

export default new FinalGradeService();
