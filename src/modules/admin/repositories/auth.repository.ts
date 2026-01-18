import apiFractal from "@/shared/helpers/axios/api-fractal";
import type { ApiResponse } from "@/shared/interface/api-response";
import type { MeResponse } from "../models/auth.model";
import type { MeResponseDTO } from "../dto/auth.dto";
import { meAdapter } from "../adapters/auth.adapter";

class AuthRepository {
  private route: string;

  constructor() {
    this.route = "auth";
  }

  async me(): Promise<ApiResponse<MeResponse | null>> {
    const response = await apiFractal.get<MeResponseDTO>(`${this.route}/me`);
    let data: MeResponse | null = null;
    if (response.data) {
      data = meAdapter.one(response.data);
    }
    return { ...response, data };
  }
}

export default new AuthRepository();
