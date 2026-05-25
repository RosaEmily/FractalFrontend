import apiClient from "@/shared/helpers/axios/api-fractal";
import { GeneralAdapter } from "../adapters/general.adapter";
import type { GeneralDTO } from "../dto/general.dto";
import type { General } from "../models/general.model";
import type { ApiResponse } from "@/shared/interface/api-response";

class GeneralRepository {
  private readonly route = "landing/general";

  async get(): Promise<ApiResponse<General>> {
    const response = await apiClient.get<GeneralDTO>(this.route);
    return { ...response, data: response.data ? GeneralAdapter.one(response.data) : null };
  }
}

export const generalRepository = new GeneralRepository();
