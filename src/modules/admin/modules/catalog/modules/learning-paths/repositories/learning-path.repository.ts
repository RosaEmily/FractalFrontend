import { BaseRepository } from "@/modules/admin/repositories/base.repository";
import type { LearningPathRepositoryTypes } from "../models/learning-path.model";
import { LearningPathAdapter } from "../adapters/learning-path.adapter";

class LearningPathRepository extends BaseRepository<LearningPathRepositoryTypes> {
  constructor() {
    super("academic/learning-paths", LearningPathAdapter);
  }
}

export default new LearningPathRepository();
