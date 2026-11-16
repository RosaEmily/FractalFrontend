import apiClient from "@/shared/helpers/axios/api-fractal";
import { LearningPathAdapter } from "../adapters/learning-path.adapter";
import type { LearningPathDTO } from "../dto/learning-path.dto";
import type { LearningPath } from "../models/learning-path.model";
import type { ApiResponse } from "@/shared/interface/api-response";

class LearningPathRepository {
  private readonly route = "landing/learning-paths";

  /** Líneas de carrera con al menos una oferta activa. Puede venir vacío. */
  async get(): Promise<ApiResponse<LearningPath[]>> {
    const response = await apiClient.get<LearningPathDTO[]>(this.route);
    return {
      ...response,
      data: response.data ? LearningPathAdapter.many(response.data) : null,
    };
  }
}

export const learningPathRepository = new LearningPathRepository();
