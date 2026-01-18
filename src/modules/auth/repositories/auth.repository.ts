import apiFractal from "@/shared/helpers/axios/api-fractal";
import type { ApiResponse } from "@/shared/interface/api-response";
import type { AuthResponse } from "../models/auth.model";
import type { AuthRequestDTO, AuthResponseDTO } from "../dto/auth.dto";
import { authAdapter } from "../adapters/auth.adapter";

class AuthRepository {
  private route: string;

  constructor() {
    this.route = "auth";
  }

  async login(req: AuthRequestDTO): Promise<ApiResponse<AuthResponse | null>> {
    const response = await apiFractal.post<AuthResponseDTO>(
      `${this.route}/login`,
      req,
    );
    let data: AuthResponse | null = null;
    if (response.data) {
      data = authAdapter.one(response.data);
    }
    return { ...response, data };
  }
}

export default new AuthRepository();
