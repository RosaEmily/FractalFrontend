import apiClient from "@/shared/helpers/axios/api-fractal";
import { TeacherAdapter } from "../adapters/teacher.adapter";
import type { TeacherDetailDTO, TeacherDTO } from "../dto/teacher.dto";
import type { TeacherDetail, TeacherList, TeacherQuery } from "../models/teacher.model";
import type { ApiResponse } from "@/shared/interface/api-response";

class TeacherRepository {
  private readonly route = "landing/teachers";

  async get(favoritesOnly = true, params: TeacherQuery = {}): Promise<ApiResponse<TeacherList>> {
    const response = await apiClient.get<TeacherDTO[] | {
      items: TeacherDTO[];
      meta: NonNullable<TeacherList["meta"]>;
      stats: TeacherList["stats"];
      specialties: string[];
    }>(this.route, {
      params: { ...params, favorites_only: favoritesOnly ? "1" : "0" },
    });
    const result = response.data;
    return {
      ...response,
      data: !result ? null : Array.isArray(result)
        ? TeacherAdapter.many(result)
        : { ...TeacherAdapter.many(result.items), meta: result.meta, stats: result.stats, specialties: result.specialties },
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
