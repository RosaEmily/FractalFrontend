import authRepository from "../repositories/auth.repository";
import type { MeResponse } from "../models/auth.model";

class AuthService {
  async me(): Promise<MeResponse | null> {
    const resp = await authRepository.me();
    return resp.data;
  }

  async logout(): Promise<null> {
    const resp = await authRepository.logout();
    return resp.data;
  }
}
export default new AuthService();
