import apiClient from "@/shared/helpers/axios/api-fractal";
import { TeacherAdapter } from "../adapters/teacher.adapter";
import type { TeacherDTO } from "../dto/teacher.dto";
import type { TeacherList } from "../models/teacher.model";
import type { ApiResponse } from "@/shared/interface/api-response";

class TeacherRepository {
  private readonly route = "landing/teachers";

  async get(): Promise<ApiResponse<TeacherList>> {
    const response = await apiClient.get<TeacherDTO[]>(this.route);
    return {
      ...response,
      data: response.data ? TeacherAdapter.many(response.data) : null,
    };
  }
}

export const teacherRepository = new TeacherRepository();
