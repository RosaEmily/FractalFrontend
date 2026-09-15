import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { FinalGradeRepositoryTypes } from "../models/final-grade.model";
import { FinalGradeAdapter } from "../adapters/final-grade.adapter";

class FinalGradeRepository extends BaseRepository<FinalGradeRepositoryTypes> {
  constructor() {
    super("evaluations/final-grades", FinalGradeAdapter);
  }
}

export default new FinalGradeRepository();
