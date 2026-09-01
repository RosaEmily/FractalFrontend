import profileRepository from "../repositories/profile.repository";
import type { Profile, Session } from "../models/profile.model";
import type {
  ChangePasswordBodyDTO,
  ProfileUpdateBodyDTO,
} from "../dto/profile.dto";

class ProfileService {
  async show(): Promise<Profile | null> {
    const resp = await profileRepository.show();
    return resp.data;
  }

  async update(
    body: ProfileUpdateBodyDTO,
    photo?: File | null,
  ): Promise<Profile | null> {
    const resp = await profileRepository.update(body, photo);
    return resp.data;
  }

  /** Devuelve cuántas sesiones se cerraron al cambiar la contraseña. */
  async changePassword(body: ChangePasswordBodyDTO): Promise<number> {
    const resp = await profileRepository.changePassword(body);
    return resp.data?.revoked_sessions ?? 0;
  }

  async sessions(): Promise<Session[]> {
    const resp = await profileRepository.sessions();
    return resp.data ?? [];
  }

  async revokeSession(id: number): Promise<null> {
    const resp = await profileRepository.revokeSession(id);
    return resp.data;
  }
}

export default new ProfileService();
