import { learningPathRepository } from "../repositories/learning-path.repository";
import type { LearningPath } from "../models/learning-path.model";

class LearningPathService {
  async get(): Promise<LearningPath[]> {
    const resp = await learningPathRepository.get();
    return resp.data ?? [];
  }
}

export const learningPathService = new LearningPathService();
