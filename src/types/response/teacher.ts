import type { ApiResponse } from "@/types/response/api";
import type { TeacherData } from "@/types/teacher";

export interface LandingTeacherData {
  teachers: TeacherData[]
}

export interface LandingTeacherResponse extends ApiResponse<LandingTeacherData> {
  data: LandingTeacherData
}