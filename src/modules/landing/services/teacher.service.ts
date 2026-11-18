import { teacherRepository } from "../repositories/teacher.repository";
import type { TeacherDetail, TeacherList, TeacherQuery } from "../models/teacher.model";

class TeacherService {
  async get(favoritesOnly = true, params: TeacherQuery = {}): Promise<TeacherList | null> {
    const resp = await teacherRepository.get(favoritesOnly, params);
    return resp.data;
  }

  async getByDocumentNumber(
    documentNumber: string,
  ): Promise<TeacherDetail | null> {
    const resp = await teacherRepository.getByDocumentNumber(documentNumber);
    return resp.data;
  }
}

export const teacherService = new TeacherService();
