import authRepository from "../repositories/auth.repository";
import type { AuthResponse } from "../models/auth.model";
import type { AuthRequestDTO } from "../dto/auth.dto";

class AuthService {
  async login(data: AuthRequestDTO): Promise<AuthResponse | null> {
    const resp = await authRepository.login(data);
    return resp.data;
  }
}
export default new AuthService();
