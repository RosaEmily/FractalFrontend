import apiFractal from "@/shared/helpers/axios/api-fractal";
import type { ApiResponse } from "@/shared/interface/api-response";
import type { Profile, Session } from "../models/profile.model";
import type {
  ProfileDTO,
  SessionDTO,
  ChangePasswordBodyDTO,
  ChangePasswordResponseDTO,
  ProfileUpdateBodyDTO,
} from "../dto/profile.dto";
import { profileAdapter, sessionAdapter } from "../adapters/profile.adapter";

/**
 * No extiende BaseRepository: estos endpoints operan sobre el usuario del
 * token, no reciben id y no siguen el patrón CRUD (sin list/bulk-delete).
 */
class ProfileRepository {
  private route = "auth";

  async show(): Promise<ApiResponse<Profile | null>> {
    const response = await apiFractal.get<ProfileDTO>(`${this.route}/profile`);
    return {
      ...response,
      data: response.data ? profileAdapter.one(response.data) : null,
    };
  }

  /**
   * POST y no PUT: la foto viaja como multipart y PHP no parsea
   * multipart/form-data en peticiones PUT.
   */
  async update(
    body: ProfileUpdateBodyDTO,
    photo?: File | null,
  ): Promise<ApiResponse<Profile | null>> {
    const payload = new FormData();

    Object.entries(body).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        payload.append(key, String(value));
      }
    });

    if (photo) payload.append("photo_url", photo);

    // El cliente fija Content-Type: application/json por defecto; hay que
    // sobrescribirlo para que el navegador ponga el boundary del multipart.
    const response = await apiFractal.post<ProfileDTO>(
      `${this.route}/profile`,
      payload,
      { headers: { "Content-Type": "multipart/form-data" } },
    );

    return {
      ...response,
      data: response.data ? profileAdapter.one(response.data) : null,
    };
  }

  async changePassword(
    body: ChangePasswordBodyDTO,
  ): Promise<ApiResponse<ChangePasswordResponseDTO | null>> {
    return await apiFractal.post<ChangePasswordResponseDTO>(
      `${this.route}/change-password`,
      body,
    );
  }

  async sessions(): Promise<ApiResponse<Session[]>> {
    const response = await apiFractal.get<SessionDTO[]>(
      `${this.route}/sessions`,
    );
    return {
      ...response,
      data: response.data ? sessionAdapter.many(response.data) : [],
    };
  }

  async revokeSession(id: number): Promise<ApiResponse<null>> {
    return await apiFractal.delete(`${this.route}/sessions/${id}`);
  }
}

export default new ProfileRepository();
