import type { LandingTeacherData } from '@/types/response/teacher'

export interface ILandingTeacherRepository {
  fetchLandingTeacherData(): Promise<LandingTeacherData>
}