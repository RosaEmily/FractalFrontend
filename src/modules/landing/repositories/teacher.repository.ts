import apiClient from "@/shared/helpers/axios/api-fractal";
import { TeacherAdapter } from "../adapters/teacher.adapter";
import type { TeacherDetailDTO, TeacherDTO } from "../dto/teacher.dto";
import type { TeacherDetail, TeacherList } from "../models/teacher.model";
import type { ApiResponse } from "@/shared/interface/api-response";

class TeacherRepository {
  private readonly route = "landing/teachers";

  /**
   * Por defecto trae solo los 5 favoritos (lo consume el Home). El listado
   * completo de `/instructors` necesita TODOS los docentes activos, o el
   * detalle solo podría enlazar a esos 5.
   */
  async get(favoritesOnly = true): Promise<ApiResponse<TeacherList>> {
    const response = await apiClient.get<TeacherDTO[]>(this.route, {
      params: { favorites_only: favoritesOnly ? "1" : "0" },
    });
    return {
      ...response,
      data: response.data ? TeacherAdapter.many(response.data) : null,
    };
  }

  async getByDocumentNumber(
    documentNumber: string,
  ): Promise<ApiResponse<TeacherDetail>> {
    const response = await apiClient.get<TeacherDetailDTO>(
      `${this.route}/${documentNumber}`,
    );
    return {
      ...response,
      data: response.data ? TeacherAdapter.detail(response.data) : null,
    };
  }
}

export const teacherRepository = new TeacherRepository();
